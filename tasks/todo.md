# Label to ID を /label2id API に載せ替える実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `LabelToIdTable` の外部サービス直叩き（約100行）を togoid-api の `/label2id` への 1 リクエストに置き換え、GRASP も `/grasp` プロキシ経由にして、フロントから外部ドメインへの直接アクセスをなくす。

**Architecture:** `LabelToId` が入力を `labelToIdParam` シグナルに詰め、`LabelToIdTable` が SWR で `/label2id` を 1 回叩き、固定 5 キー (`input, match_type, name, score, id`) の行配列をそのまま描画する。上流の分岐・区切り文字・N+1・整形はすべてサーバ側に移る。Report トグルは常に `report=full` で取得したうえで手元で絞る。

**Tech Stack:** Next.js 16 (static export) / React 19 / @preact/signals-react / SWR 2 / axios / TypeScript / SCSS

**設計書:** `docs/superpowers/specs/2026-08-04-label2id-frontend-refactor-design.md`

## Global Constraints

- 依存 PR: Phase 1 は togoid-api [#153](https://github.com/togoid/togoid-api/pull/153)、Phase 2 は [#152](https://github.com/togoid/togoid-api/pull/152)。**どちらもマージ・デプロイされるまで着手しない**（2026-08-04 時点で dev/本番とも 404）
- API のベース URL は必ず `process.env.NEXT_PUBLIC_API_ENDPOINT` を使う。外部ドメインをコードに直書きしない
- `@preact/signals-react` の `signal` / `computed` / `useSignal` / `useSignals` と、`src/hooks` `src/lib` `src/components` 配下のデフォルトエクスポートは `unplugin-auto-import` により自動 import される。**import 文を追加しない**（`next.config.ts` の設定に従う）
- 表の列構成、エクスポートの列名と内容、既存のクラス名は変更しない
- このリポジトリにテストランナーはない。検証は lint / 型検査 / ビルド / 実機確認で行う
- 型検査のベースライン: `npx tsc --noEmit` は `src/components/Header.tsx(92,15): error TS2353 ... 'enableBackground'` の **1 件のみ**が出る状態。この 1 件以外が出たら退行とみなす
- `node_modules` が package.json と乖離している（eslint 9.38.0 が入っているが package.json は 10.2.0、yarn state file なし）。着手前に `yarn install` を 1 回実行する
- `prettier/prettier` が error レベルで設定されている。この計画のコード片は整形済みのつもりだが、ずれたら `npx eslint --fix` で揃える

---

## Task 0: 前提確認

**Files:** なし（確認のみ）

- [x] **Step 1: 依存 PR のデプロイを確認する**

```bash
curl -s -o /dev/null -w "label2id: %{http_code}\n" \
  "https://api.togoid.dbcls.jp.il3c.com/label2id?dataset=chebi&labels=glucose"
curl -s -o /dev/null -w "grasp: %{http_code}\n" -X POST \
  "https://api.togoid.dbcls.jp.il3c.com/grasp" \
  -H "Content-Type: application/json" -d '{"query":"{__typename}"}'
```

Expected: Phase 1 に着手するには `label2id: 200`、Phase 2 に着手するには `grasp: 200`。404 が返るフェーズには着手しない。

- [x] **Step 2: 実レスポンスの形を確認する**

```bash
curl -s "https://api.togoid.dbcls.jp.il3c.com/label2id?dataset=chebi&labels=glucose&report=full" | head -40
```

Expected: `[{"input":"glucose","match_type":"...","name":"...","score":...,"id":"..."}, ...]` の配列。キー名が `input, match_type, name, score, id` であること。**違っていたらここで止めて設計書を更新する**。

- [x] **Step 3: 依存をインストールし、ベースラインを記録する**

```bash
yarn install
npx tsc --noEmit
npx eslint
```

Expected: `tsc` は Header.tsx の 1 件のみ。`eslint` はエラーなし。ここで出た内容を退行判定の基準にする。

---

# Phase 1 — /label2id への載せ替え（#153 依存）

## Task 1: レスポンス行の型を宣言する

**Files:**
- Create: `@types/api.d.ts`

**Interfaces:**
- Produces: グローバル型 `Label2idRow`。Task 2 の `LabelToIdTable` がレスポンス型として使う

- [x] **Step 1: 型定義ファイルを作る**

`@types/api.d.ts`:

```ts
// togoid-api /label2id のレスポンス行。リゾルバによらずキーは固定で、
// report=full のときの未マッチ行は input 以外がすべて null になる。
// SPARQList 系のデータセットでは score が常に null。
type Label2idRow = {
  input: string;
  match_type: string | null;
  name: string | null;
  score: number | null;
  id: string | null;
};
```

- [x] **Step 2: 型が解決されることを確認する**

```bash
npx tsc --noEmit
```

Expected: Header.tsx の 1 件のみ。新しいエラーが出ないこと。

- [x] **Step 3: コミット**

```bash
git add @types/api.d.ts
git commit -m "feat(types): /label2id のレスポンス行型 Label2idRow を追加"
```

---

## Task 2: LabelToId / LabelToIdTable を /label2id に載せ替える

`LabelToId` が渡すプロパティ名と `LabelToIdTable` が受け取るデータ形状が同時に変わるため、この 2 ファイルは 1 タスクで一緒に変更する。片方だけ変えると型が通らない。

**Files:**
- Modify: `src/components/LabelToId.tsx:14-20`（signal 定義）、`:46-70`（handleExecute）、`:151-157`（子への受け渡し）
- Modify: `src/components/LabelToIdTable.tsx:8-18`（Props）、`:35-163`（フェッチャと整形）、`:165-217`（アクション）、`:313-346`（表の行）

**Interfaces:**
- Consumes: Task 1 の `Label2idRow`
- Produces: `labelToIdParam: Signal<{ dataset: string; labels: string[]; labelTypes: string[]; taxon?: string; threshold?: number }>`。Task 3 のエラー表示が同じコンポーネント内の SWR を参照する

- [x] **Step 1: LabelToId.tsx の signal 定義を差し替える**

`src/components/LabelToId.tsx` の 14〜20 行を置き換える。

置き換え前:

```tsx
const pubdictionariesParam = signal({
  labelList: [] as string[],
  dictionaries: "",
  tags: undefined as string | undefined,
  threshold: undefined as number | undefined,
  verbose: true,
});
```

置き換え後:

```tsx
const labelToIdParam = signal({
  dataset: "",
  labels: [] as string[],
  labelTypes: [] as string[],
  taxon: undefined as string | undefined,
  threshold: undefined as number | undefined,
});
```

- [x] **Step 2: handleExecute を書き換える**

`src/components/LabelToId.tsx` の 57〜67 行（`// exanple: ovarian cancer` のコメントから `};` まで）を置き換える。46〜56 行のラベル分割処理は変えない。

置き換え前:

```tsx
    // exanple: ovarian cancer
    pubdictionariesParam.value = {
      labelList: labelList,
      dictionaries: selectDictionaryList.value
        .filter(([_, value]) => value.checked)
        .map(([key, _]) => key)
        .join(","),
      tags: dataset.value?.label_resolver?.taxonomy ? species.value : undefined,
      threshold: dataset.value?.label_resolver?.threshold ? threshold.value : 1,
      verbose: true,
    };
```

置き換え後:

```tsx
    // example: ovarian cancer
    labelToIdParam.value = {
      dataset: dataset.value!.key,
      labels: labelList,
      labelTypes: selectDictionaryList.value
        .filter(([_, value]) => value.checked)
        .map(([key, _]) => key),
      taxon: dataset.value?.label_resolver?.taxonomy ? species.value : undefined,
      // 閾値非対応のデータセットに 1 を送って完全一致にする逆算はサーバ側の既定に任せる。
      // verbose も /label2id が内部で固定するため送らない
      threshold: dataset.value?.label_resolver?.threshold
        ? threshold.value
        : undefined,
    };
```

- [x] **Step 3: 子コンポーネントへの受け渡しを直す**

`src/components/LabelToId.tsx` の 152〜153 行:

置き換え前:

```tsx
        <LabelToIdTable
          pubdictionariesParam={pubdictionariesParam}
```

置き換え後:

```tsx
        <LabelToIdTable
          labelToIdParam={labelToIdParam}
```

- [x] **Step 4: LabelToIdTable.tsx の Props 型を差し替える**

`src/components/LabelToIdTable.tsx` の 8〜24 行を置き換える。

置き換え前:

```tsx
type Props = {
  pubdictionariesParam: Signal<{
    labelList: string[];
    dictionaries: string;
    tags?: string;
    threshold?: number;
    verbose: boolean;
  }>;
  dataset: Signal<DatasetConfig[number] & { key: string }>;
  executeExamples: (idList: string[], exampleTarget: string) => void;
};

const LabelToIdTable = ({
  pubdictionariesParam,
  dataset,
  executeExamples,
}: Props) => {
```

置き換え後:

```tsx
type Props = {
  labelToIdParam: Signal<{
    dataset: string;
    labels: string[];
    labelTypes: string[];
    taxon?: string;
    threshold?: number;
  }>;
  dataset: Signal<DatasetConfig[number] & { key: string }>;
  executeExamples: (idList: string[], exampleTarget: string) => void;
};

const LabelToIdTable = ({
  labelToIdParam,
  dataset,
  executeExamples,
}: Props) => {
```

- [x] **Step 5: フェッチャを 1 リクエストに置き換える**

`src/components/LabelToIdTable.tsx` の 35〜139 行（`const { data: tableData, isLoading } = useSWRImmutable(` から対応する `);` まで）を、まるごと次に置き換える。

```tsx
  const { data: tableData, isLoading } = useSWRImmutable(
    labelToIdParam.value,
    async (param) => {
      NProgress.start();
      try {
        const res = await axios.get<Label2idRow[]>(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/label2id`,
          {
            params: {
              dataset: param.dataset,
              labels: param.labels.join(","),
              label_types: param.labelTypes.join(","),
              taxon: param.taxon,
              threshold: param.threshold,
              // 未マッチ行も含めて取得し、Report の切り替えは再取得せず手元で絞る
              report: "full",
            },
          },
        );
        return res.data;
      } finally {
        NProgress.done();
      }
    },
  );
```

`axios` は `undefined` のパラメータをクエリ文字列に含めないため、`taxon` と `threshold` は該当データセット以外では送られない。

- [x] **Step 6: 未マッチ行の合成を絞り込みに置き換える**

`src/components/LabelToIdTable.tsx` の `tableDataMod`（Step 5 適用後は 141〜163 行相当）を置き換える。

置き換え前:

```tsx
  const tableDataMod = useMemo(() => {
    return computed(() => {
      if (!tableData) {
        return [];
      }

      if (report.value === "matched") {
        return tableData.flat();
      } else {
        return tableData.flatMap((v, i) => {
          return v.length
            ? v
            : {
                label: pubdictionariesParam.value.labelList[i],
                type: "Unmatched",
                symbolOrName: "",
                score: "",
                identifier: "",
              };
        });
      }
    });
  }, [tableData]);
```

置き換え後:

```tsx
  const tableDataMod = useMemo(() => {
    return computed(() => {
      if (!tableData) {
        return [];
      }

      // report=full で取得しているので、Matched は id を持つ行だけに絞る
      return report.value === "matched"
        ? tableData.filter((v) => v.id)
        : tableData;
    });
  }, [tableData]);
```

- [x] **Step 7: inputResultId のキーを追従させる**

`src/components/LabelToIdTable.tsx` の `inputResultId`:

置き換え前:

```tsx
    const idList = tableDataMod.value
      .filter((v) => v.identifier)
      .map((v) =>
        joinPrefix(
          v.identifier,
```

置き換え後:

```tsx
    const idList = tableDataMod.value
      .filter((v) => v.id)
      .map((v) =>
        joinPrefix(
          v.id ?? undefined,
```

`joinPrefix` の第 1 引数は `string | undefined` なので、`null` は `undefined` に寄せる。

- [x] **Step 8: createExportTable のキーを追従させる**

`src/components/LabelToIdTable.tsx` の `createExportTable` を置き換える。

置き換え前:

```tsx
  const createExportTable = () => {
    return tableDataMod.value.map((v) => {
      const id = v.identifier ? joinPrefix(v.identifier, lineMode.value) : "";

      if (dataset.value?.label_resolver?.taxonomy) {
        return {
          Input: v.label,
          "Match type": v.type,
          Symbol: v.symbolOrName,
          ID: id,
        };
      } else {
        return {
          Input: v.label,
          "Match type": v.type,
          Name: v.symbolOrName,
          Score: v.score,
          ID: id,
        };
      }
    });
  };
```

置き換え後:

```tsx
  const createExportTable = () => {
    return tableDataMod.value.map((v) => {
      const id = v.id ? joinPrefix(v.id, lineMode.value) : "";
      const matchType = v.match_type ?? "Unmatched";

      if (dataset.value?.label_resolver?.taxonomy) {
        return {
          Input: v.input,
          "Match type": matchType,
          Symbol: v.name ?? "",
          ID: id,
        };
      } else {
        return {
          Input: v.input,
          "Match type": matchType,
          Name: v.name ?? "",
          Score: v.score ?? "",
          ID: id,
        };
      }
    });
  };
```

- [x] **Step 9: 表の行のキーを追従させる**

`src/components/LabelToIdTable.tsx` の `<tbody>` 内を置き換える。表のヘッダ（`<thead>` の taxonomy / threshold 分岐）は変更しない。

置き換え前:

```tsx
                  {tableDataMod.value.map((v, i) => (
                    <tr key={i}>
                      <td>{v.label}</td>
                      <td>{v.type}</td>
                      {dataset.value?.label_resolver?.taxonomy && (
                        <td>{v.symbolOrName}</td>
                      )}
                      {dataset.value?.label_resolver?.threshold && (
                        <>
                          <td>{v.symbolOrName}</td>
                          <td>{v.score}</td>
                        </>
                      )}
                      <td>
                        {v.identifier && (
                          <a
                            href={joinPrefix(
                              v.identifier,
                              lineMode.value.key === "url"
                                ? lineMode.value
                                : {
                                    key: "url",
                                    value: dataset.value.prefix[0].uri,
                                  },
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {joinPrefix(v.identifier, lineMode.value)}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
```

置き換え後:

```tsx
                  {tableDataMod.value.map((v, i) => (
                    <tr key={i}>
                      <td>{v.input}</td>
                      <td>{v.match_type ?? "Unmatched"}</td>
                      {dataset.value?.label_resolver?.taxonomy && (
                        <td>{v.name}</td>
                      )}
                      {dataset.value?.label_resolver?.threshold && (
                        <>
                          <td>{v.name}</td>
                          <td>{v.score}</td>
                        </>
                      )}
                      <td>
                        {v.id && (
                          <a
                            href={joinPrefix(
                              v.id,
                              lineMode.value.key === "url"
                                ? lineMode.value
                                : {
                                    key: "url",
                                    value: dataset.value.prefix[0].uri,
                                  },
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {joinPrefix(v.id, lineMode.value)}
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
```

- [x] **Step 10: 型検査と lint を通す**

```bash
npx tsc --noEmit
npx eslint
```

Expected: `tsc` は Header.tsx の 1 件のみ。`eslint` はエラーなし。

- [x] **Step 11: ビルドが通ることを確認する**

```bash
yarn build2
```

Expected: 正常終了。

- [x] **Step 12: コミット**

```bash
git add src/components/LabelToId.tsx src/components/LabelToIdTable.tsx
git commit -m "refactor(label-to-id): 外部サービス直叩きを /label2id への1リクエストに置き換え"
```

---

## Task 3: 取得失敗時のエラー表示を足す

現状はエラー処理がなく、上流が想定外の形を返すと表が出ないまま無反応になる。`/label2id` は 400 と 502 を `{"message": "..."}` で返すので、これを 1 行で表示する。

**Files:**
- Modify: `src/components/LabelToIdTable.tsx`（`tableDataMod` の直後にメッセージ導出を追加、`return` 直下に描画を追加）
- Modify: `src/styles/components/_labelToIdTable.scss`

**Interfaces:**
- Consumes: Task 2 の SWR が返す `error`

- [x] **Step 1: SWR から error を受け取る**

Task 2 Step 5 で書いた分割代入に `error` を足す。

置き換え前:

```tsx
  const { data: tableData, isLoading } = useSWRImmutable(
```

置き換え後:

```tsx
  const {
    data: tableData,
    error,
    isLoading,
  } = useSWRImmutable(
```

- [x] **Step 2: エラーメッセージを導出する**

`src/components/LabelToIdTable.tsx` の `tableDataMod` の定義の直後に追加する。

```tsx
  const errorMessage = useMemo(() => {
    if (!error) {
      return null;
    }
    // /label2id は 400 / 502 を {"message": "..."} で返す
    if (axios.isAxiosError(error)) {
      return (
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message
      );
    }
    return "Failed to resolve labels.";
  }, [error]);
```

- [x] **Step 3: 描画に差し込む**

`src/components/LabelToIdTable.tsx` の `return (` 直後を置き換える。

置き換え前:

```tsx
    <div className="label-to-id-table">
      {(!isLoading || Boolean(tableDataMod.value.length)) && (
```

置き換え後:

```tsx
    <div className="label-to-id-table">
      {errorMessage && <p className="error">{errorMessage}</p>}
      {!errorMessage && (!isLoading || Boolean(tableDataMod.value.length)) && (
```

- [x] **Step 4: スタイルを足す**

`src/styles/components/_labelToIdTable.scss` の `.heading` ブロック（7〜16 行）の直後に追加する。

```scss
  .error {
    font-size: 1.4rem;
    line-height: 1.5;
    color: g.$col-B31D28;
    padding: 12px 16px;
    border-radius: 5px;
    background-color: g.$col-FFEEF0;
  }
```

- [x] **Step 5: 型検査と lint を通す**

```bash
npx tsc --noEmit
npx eslint
```

Expected: `tsc` は Header.tsx の 1 件のみ。`eslint` はエラーなし。

- [x] **Step 6: エラー表示を実際に出して確認する**

`yarn dev` で開発サーバを起動し、ブラウザの DevTools で `/label2id` へのリクエストを一時的に失敗させる（Network タブの block request URL に `*/label2id*` を登録する）。Label to ID タブで EXECUTE し、表の代わりにメッセージが 1 行出て、コンソールに未捕捉の TypeError が出ないことを確認する。

- [x] **Step 7: コミット**

```bash
git add src/components/LabelToIdTable.tsx src/styles/components/_labelToIdTable.scss
git commit -m "feat(label-to-id): /label2id の失敗時にエラーメッセージを表示する"
```

---

## Task 4: Phase 1 の実機確認

**Files:** なし（確認のみ）

- [x] **Step 1: 開発サーバを起動する**

```bash
yarn dev
```

`.env.development` の `NEXT_PUBLIC_API_ENDPOINT` が `https://api.togoid.dbcls.jp.il3c.com` を指していることを確認する。

- [x] **Step 2: SPARQList 系（ncbigene）を確認する**

Label to ID タブで Dataset に NCBI Gene を選び、Species を Homo sapiens、ラベルに `TP53` と `BRCA1` を入力して EXECUTE。

Expected: Symbol 列が出て Score 列が出ないこと。`TP53 → 7157`、`BRCA1 → 672`。Species を別の種に変えると結果が変わること。

- [x] **Step 3: PubDictionaries 系（chebi）を確認する**

Dataset に ChEBI を選び、ラベルに `glucose` と `caffeine` を入力して EXECUTE。

Expected: Name 列と Score 列が出ること。synonym にヒットした行の Name が代表名になっていること（`glucose` の Related synonym で `D-glucopyranose`）。閾値スライダを動かすと結果の件数が変わること。

- [x] **Step 4: Report トグルを確認する**

存在しないラベル（例 `zzzznotalabel`）を混ぜて EXECUTE し、"Matched labels" と "Include unmatched labels" を切り替える。

Expected: 切り替えでネットワークリクエストが発生しない（DevTools の Network タブで確認）。"Include unmatched labels" のときだけ Match type が `Unmatched` の行が出ること。

- [x] **Step 5: 4 つのアクションを確認する**

Convert IDs / Copy to Clipboard / Download as CSV / Download as TSV を実行する。ID 欄のセレクトで prefix と URL を切り替えてから再度エクスポートする。

Expected: 変更前と同じ列名・同じ内容。ID 列がセレクトの選択（素の ID / prefix 付き / URL）を反映すること。

- [x] **Step 6: N+1 が解消されていることを確認する**

ラベルを 20 件ほど入力して EXECUTE し、DevTools の Network タブを見る。

Expected: `pubdictionaries.org` および `dx.dbcls.jp` へのリクエストが 0 件。`/label2id` が 1 件だけ。

---

# Phase 2 — GRASP を /grasp プロキシ経由にする（#152 依存）

## Task 5: GRASP の向き先を API プロキシに変える

**Files:**
- Modify: `src/lib/queries.ts:111-113`
- Modify: `src/hooks/useAnnotateConfig.ts:8-9`

- [x] **Step 1: queries.ts を直す**

`src/lib/queries.ts` の 111〜113 行:

置き換え前:

```ts
  const res = await axios.post<{
    data: any[][];
  }>(process.env.NEXT_PUBLIC_GRASP_ENDPOINT!, data);
```

置き換え後:

```ts
  const res = await axios.post<{
    data: any[][];
  }>(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/grasp`, data);
```

- [x] **Step 2: useAnnotateConfig.ts を直す**

`src/hooks/useAnnotateConfig.ts` の 8〜9 行:

置き換え前:

```ts
      const response = await axios({
        url: process.env.NEXT_PUBLIC_GRASP_ENDPOINT,
```

置き換え後:

```ts
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/grasp`,
```

- [x] **Step 3: 参照が残っていないことを確認する**

```bash
grep -rn "NEXT_PUBLIC_GRASP_ENDPOINT" --include="*.ts" --include="*.tsx" src
```

Expected: 出力なし。

- [x] **Step 4: 型検査と lint を通す**

```bash
npx tsc --noEmit
npx eslint
```

Expected: `tsc` は Header.tsx の 1 件のみ。`eslint` はエラーなし。

- [x] **Step 5: Annotation が動くことを確認する**

`yarn dev` で起動し、変換結果のモーダルを開いて Annotation 列を追加する。

Expected: 列が表示されること。DevTools の Network タブで `/grasp` への POST が 200 で返り、その前に OPTIONS のプリフライトが CORS エラーにならないこと。`dx.dbcls.jp` への直接リクエストが 0 件であること。

- [x] **Step 6: コミット**

```bash
git add src/lib/queries.ts src/hooks/useAnnotateConfig.ts
git commit -m "refactor(grasp): GRASP の直叩きを togoid-api の /grasp プロキシ経由にする"
```

---

## Task 6: 環境変数を整理する

**Files:**
- Modify: `.env.development`
- Modify: `.env.example`
- Modify: `README.md:3-7`

- [x] **Step 1: .env.development から GRASP を削除する**

置き換え前:

```
NEXT_PUBLIC_API_ENDPOINT=https://api.togoid.dbcls.jp.il3c.com
NEXT_PUBLIC_GRASP_ENDPOINT=https://dx.dbcls.jp/grasp-dev-togoid
NEXT_PUBLIC_DOCUMENT_ENDPOINT=https://raw.githubusercontent.com/togoid/togoid-config/develop/docs
```

置き換え後:

```
NEXT_PUBLIC_API_ENDPOINT=https://api.togoid.dbcls.jp.il3c.com
NEXT_PUBLIC_DOCUMENT_ENDPOINT=https://raw.githubusercontent.com/togoid/togoid-config/develop/docs
```

GRASP の向き先は togoid-api 側の `GRASP_ENDPOINT`（#153 で `config/environments/dev.yml` が `grasp-dev-togoid` を指す）で決まる。

- [x] **Step 2: .env.example を実態に合わせる**

置き換え前:

```
NEXT_PUBLIC_API_ENDPOINT=https://api.example.org
```

置き換え後:

```
NEXT_PUBLIC_API_ENDPOINT=https://api.example.org
NEXT_PUBLIC_DOCUMENT_ENDPOINT=https://raw.githubusercontent.com/togoid/togoid-config/main/docs
```

- [x] **Step 3: README の参照ファイル名を直す**

`README.md` の 3〜7 行。存在しない `.env.sample` を参照している。

置き換え前:

```markdown
## Set env
```bash
cp .env.sample .env
# Rewrite environment variables of .env
```
```

置き換え後:

```markdown
## Set env
```bash
cp .env.example .env
# Rewrite environment variables of .env
```
```

- [x] **Step 4: ビルドが通ることを確認する**

```bash
yarn build2
```

Expected: 正常終了。

- [x] **Step 5: コミット**

```bash
git add .env.development .env.example README.md
git commit -m "chore(env): NEXT_PUBLIC_GRASP_ENDPOINT を削除し .env の記載を実態に合わせる"
```

- [ ] **Step 6: Amplify の環境変数から削除する（コンソール作業）**

`output: "export"` の静的エクスポートであり環境変数はビルド時に埋め込まれるため、リポジトリの変更だけでは完結しない。Amplify コンソールの環境変数から `NEXT_PUBLIC_GRASP_ENDPOINT` を削除する。**このタスクをマージする前に実施するとビルドが壊れないか、順序を確認すること。**

---

## Task 7: 最終確認

**Files:** なし（確認のみ）

- [x] **Step 1: 一括で検証コマンドを流す**

```bash
npx tsc --noEmit
npx eslint
yarn build2
```

Expected: `tsc` は Header.tsx の 1 件のみ、`eslint` はエラーなし、ビルド成功。

- [x] **Step 2: 外部ドメイン直叩きが残っていないことを確認する**

```bash
grep -rn "dx.dbcls.jp\|pubdictionaries.org" --include="*.ts" --include="*.tsx" src
```

Expected: 出力なし。

- [x] **Step 3: レビューセクションを書く**

このファイルの末尾に、実際に行った変更の要約、想定と違った点、残課題を追記する。

---

## 残課題（この計画のスコープ外）

- **カンマを含むラベル**: `1,2-dichloroethane` のようなラベルは `LabelToId.tsx:53` の `split(/[\n,、,,]+/)` で先に割れる。上流の PubDictionaries もカンマを区切りとして扱うため API 側では回避できず、改行のみで分割する UI 変更が必要。別件として起票する
- **swagger/oas.json**: `/label2id` と #152 のプロキシ群が未掲載。togoid-api 側の OAS 更新待ち
- **#153 が閉じられた場合**: Phase 1 全体が無効になる。Phase 2 は独立して実施できる

## レビュー

実装日: 2026-08-04 / ブランチ: `feature/use-label2id-api`

### やったこと

計画どおり Task 1〜7 を実施した。コミットは 5 本。

| コミット | 内容 |
|---|---|
| `20dcb6c` | `@types/api.d.ts` に `Label2idRow` を追加 |
| `4316999` | `LabelToId` / `LabelToIdTable` を `/label2id` に載せ替え |
| `61999a6` | 取得失敗時のエラーメッセージ表示 |
| `676e987` | GRASP を `${API}/grasp` 経由に |
| `88215e7` | `NEXT_PUBLIC_GRASP_ENDPOINT` 削除と `.env` の整理 |

`LabelToIdTable.tsx` は 357 行から 260 行になった。データ取得部は 105 行が 25 行に減り、SPARQList / PubDictionaries の分岐、区切り文字の使い分け、`find_terms` の N+1、上流ごとの整形がすべて消えた。

### 想定と違った点

**依存 PR はマージ・デプロイされたが、dev API の `/label2id` と `/grasp` は 502 を返す。** ルート自体は存在し CORS ヘッダも正しく、`GRASP_ENDPOINT` も `grasp-dev-togoid` を指している。しかし Lambda から外部への接続が connect timeout する。

```
/label2id -> pubdictionaries.org へ ConnectTimeoutError (connect timeout=5)
/grasp    -> dx.dbcls.jp へ ConnectTimeoutError (connect timeout=5)
/config/dataset -> 200 (DB へは到達している)
```

同じ上流は開発端末から 1 秒以内に 200 が返るので、上流の障害ではない。DB のために Lambda が VPC 内にいて、NAT ゲートウェイなど外向きの経路がないと思われる。**togoid-api 側のインフラ課題であり、フロントの変更では回避できない。**

そのため計画の Task 0 Step 2（実レスポンスの形の確認）は、代わりにマージ済みの `tests/test_label2id.py` で確定させた。キー名・`score` の型・未マッチ行の形はいずれも設計どおりだった。

### 検証

`npx tsc --noEmit` はベースラインの `Header.tsx` 1 件のみ。`npx eslint` エラーなし。`yarn build2` 成功。

実機確認は、`/config/*` を dev API へ中継しつつ `/label2id` だけマージ済みテストのフィクスチャを返すローカルスタブを立て、Playwright で 28 項目を確認した（スクリプトはセッションのスクラッチパッドに置いた。リポジトリには入れていない）。

確認できたこと:

- ChEBI で Name + Score 列、NCBI Gene で Symbol 列（Score 列なし）
- 表・CSV・TSV の内容が `glucose → glucose / D-glucopyranose`、`TP53 → 7157` と一致
- `/label2id` へのリクエストが 1 回だけで、`report=full` を送り、`pubdictionaries.org` と `dx.dbcls.jp` へのリクエストが 0 件
- Report トグルで再取得が発生せず、未マッチ行が `Unmatched` として出る
- ID セレクトの prefix / URL がエクスポートに反映される
- Convert IDs で ID が入力欄に入る
- threshold の変更が次のリクエストに `threshold=0.8` として乗る
- species の選択が `taxon=9606` として乗る。ChEBI では `taxon` も `threshold` も送られない構成が正しく効いている
- エラー時にメッセージが出て表が出ず、未捕捉の JS 例外が発生しない

確認できていないこと:

- 実 API での正常系（上記の 502 のため）
- Annotation 列の表示。`useAnnotateConfig` が `${API}/grasp` を呼ぶところまでは確認したが、応答は 502 のまま

### 残課題

1. **togoid-api の Lambda の外向き通信**。これが直るまで、このブランチをデプロイしても Label to ID と Annotation は動かない。**マージ順序に注意が必要。**
2. **Amplify コンソールの環境変数**から `NEXT_PUBLIC_GRASP_ENDPOINT` を削除する（Task 6 Step 6、未了）
3. カンマを含むラベル、`swagger/oas.json` への `/label2id` 追加は当初どおりスコープ外
