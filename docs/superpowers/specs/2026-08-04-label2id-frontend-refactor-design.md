# Label to ID のフロントエンドを /label2id API に載せ替える

作成日: 2026-08-04
対象リポジトリ: togoid-converter (develop)
依存: togoid-api [#152](https://github.com/togoid/togoid-api/pull/152), [#153](https://github.com/togoid/togoid-api/pull/153)

## 背景

`src/components/LabelToIdTable.tsx` は、ブラウザから PubDictionaries と SPARQList を直接叩き、上流ごとに違うレスポンスを表示用の形へ整形している。この処理はデータ取得部の 35〜139 行、約 100 行を占める。

togoid-api #153 の `/label2id` は同じ手順をサーバ側に 1 つだけ持ち、リゾルバによらず `input, match_type, name, score, id` の固定 5 キーで行を返す。#152 は GRASP・SPARQList・PubDictionaries へのプロキシを追加する。両方が入れば、フロントから外部ドメインを直接叩く箇所はなくなる。

現状のフェッチャが抱えている責務は 4 つある。

- `label_resolver.sparqlist` の有無による SPARQList と PubDictionaries の分岐 (40行)
- 区切り文字の使い分け。SPARQList はカンマ (52行)、PubDictionaries はパイプ (82行)
- synonym 辞書にヒットしたIDについて `find_terms.json` を追加で叩き代表名を引く処理 (104〜114行)。ラベルごとの `Promise.all` なので、ラベル数ぶん N+1 リクエストが飛ぶ
- 上流ごとに違うレスポンス形状の整形 (62〜72行 / 116〜131行)

いずれも `/label2id` に移る。副次的に、`find_terms` の応答が想定と違う形のときに `res2?.data[v.identifier].label` (127行) が TypeError で落ちる経路も塞がる。サーバ側は代表名の取得失敗を握り潰して `name: null` で 200 を返すため、ID 解決の結果は表に出る。

なお #153 の説明にある「converter は `ids=` を使っていて壊れている」は develop では解消済みである (`30c3f4c Change pubdictionaries params ids to identifiers`, 2025-12-05)。N+1 と例外処理の指摘は現状のまま当てはまる。

## ゴール

- `LabelToIdTable` を「パラメータを渡して行を受け取り、表示する」だけの構造にする
- 外部ドメインへの直接アクセスをなくし、環境変数を `NEXT_PUBLIC_API_ENDPOINT` 1 本に寄せる
- 変更前と同じ表示・同じエクスポート結果を保つ

### やらないこと

- 表の列構成やエクスポート形式の変更
- カンマを含むラベル (`1,2-dichloroethane` 等) への対応。`LabelToId.tsx:53` の入力分割で先に割れるため UI 仕様の変更が必要であり、別件とする
- `swagger/oas.json` への `/label2id` 追加。togoid-api 側の OAS 更新が先

## データフロー

```
LabelToId (入力UI)
  └─ labelToIdParam: Signal<{ dataset, labels[], labelTypes[], taxon?, threshold? }>
       └─ LabelToIdTable
            └─ SWR: GET ${NEXT_PUBLIC_API_ENDPOINT}/label2id  (report=full 固定)
                 → Label2idRow[]
                      └─ report トグルは取得済み配列を手元で絞る
```

## 変更するファイル

| ファイル | 変更 | 依存 |
|---|---|---|
| `@types/api.d.ts` (新規) | `Label2idRow` を宣言。既存の `@types/*.d.ts` と同じグローバル型の置き方に合わせる | #153 |
| `src/components/LabelToIdTable.tsx` | フェッチャ (35〜139行) を 1 リクエストに置換。`tableDataMod` の未マッチ行合成を削除。表示のキーを `label→input` / `type→match_type` / `symbolOrName→name` / `identifier→id` に追従。エラー表示を追加 | #153 |
| `src/components/LabelToId.tsx` | `pubdictionariesParam` を `labelToIdParam` に改名・再構成。`verbose` (66行) を削除、`threshold` の逆算 (65行) を削除、`dictionaries` キーを `labelTypes` に | #153 |
| `src/lib/queries.ts:113` | GRASP の向き先を `${NEXT_PUBLIC_API_ENDPOINT}/grasp` に | #152 |
| `src/hooks/useAnnotateConfig.ts:9` | 同上 | #152 |
| `.env.development` / `.env.example` / `README.md` | `NEXT_PUBLIC_GRASP_ENDPOINT` を削除 | #152 |

`.env.example` は現在 `NEXT_PUBLIC_API_ENDPOINT` しか持たず、`NEXT_PUBLIC_DOCUMENT_ENDPOINT` が欠けている。README も存在しない `.env.sample` を参照している。Phase 2 で環境変数まわりを触るので、ついでに実態へ合わせる。

## 型

```ts
// @types/api.d.ts
type Label2idRow = {
  input: string;
  match_type: string | null;
  name: string | null;
  score: number | null;
  id: string | null;
};
```

未マッチ行 (`report=full` のとき) は `input` 以外がすべて null で返る。SPARQList 系は `score` が常に null になる。

## リクエストパラメータ

```ts
{
  dataset: string,        // dataset.value.key
  labels: string,         // カンマ区切り
  label_types: string,    // カンマ区切り。チェックが入っているものだけ
  taxon?: string,         // label_resolver.taxonomy を持つデータセットのみ
  threshold?: number,     // label_resolver.threshold を持つデータセットのみ
  report: "full",         // 固定
}
```

`verbose` はサーバが内部で固定するため送らない。閾値非対応のデータセットに `threshold: 1` を送って完全一致にしていた逆算 (`LabelToId.tsx:65`) も、サーバが `EXACT_MATCH_THRESHOLD` で同じことをするため不要になる。対応データセットのときだけ送り、それ以外は送らない。

`selectDictionaryList` を組み立てる分岐 (`LabelToId.tsx:35〜43`) は残す。config の `label_resolver` が `dictionaries` と `label_types` のどちらを持つかという設定の形の違いであり、API のパラメータ名とは別の話だからである。

## 設計判断

### report は常に full で取得し、絞り込みは手元で行う

`report` をそのままリクエストパラメータにすると、ラジオボタンを押すたびに再取得が走る。いまは即座に切り替わるので体験が落ちる。常に `report=full` で取得し、"Matched labels" のときだけ `id` が null の行を除く。未マッチ行合成のロジック (141〜163行) は消え、切り替えの即時性は保たれる。

未マッチ行は `match_type` が null で返るため、表示時に `?? "Unmatched"` として現在の見え方を保つ。

### エラー表示を最小限だけ足す

現状はエラー処理がなく、上流が想定外の形を返すと TypeError で SWR ごと落ちる。`/label2id` は 400 (dataset 未指定・labels 未指定・label_types が設定外) と 502 (上流エラー) を `{"message": "..."}` で返すので、SWR の `error` を拾って表の代わりに 1 行のメッセージを出す。新規 UI ではあるが、いまの壊れ方を塞ぐためのものであり、スコープ拡大とは考えない。

### NEXT_PUBLIC_GRASP_ENDPOINT はフォールバックを残さず削除する

#153 で API 側に `GRASP_ENDPOINT` 環境変数が入り、`config/environments/dev.yml` が `grasp-dev-togoid` を指す。converter の `.env.development` と同じ状態を API 側で持てるため、フロント側の変数は不要になる。残すと「どちらが効いているか」が二重管理になるので削除する。

`useAnnotateConfig` の introspection クエリは JSON ボディの POST なので CORS プリフライトが発生するが、#152 の `add_cors_headers` が `/grasp` の OPTIONS に対応済みである。

### 表の列出し分けとエクスポートは維持する

表の列出し分け (289〜295行) と `createExportTable` (196〜217行) の taxonomy / threshold 分岐は残す。API のキーは固定になるが、「ncbigene では Symbol 列、chebi では Name と Score 列」という表示上の選択は UI の仕様であってレスポンス形状の問題ではない。

`/label2id` の `format=csv/tsv` は CSV/TSV ダウンロードボタン (191〜194行) の代わりにならない。エクスポートする ID 列は `lineMode` で選ばれた prefix や URI 形式を反映しており (198行の `joinPrefix`)、これは手元の状態である。サーバの CSV は素の ID を返すだけなので、client-side エクスポートを維持する。

## フェーズ

依存する PR が別なので 2 本に分ける。片方だけ先にマージされても着手できる。

- **Phase 1** (#153 マージ・デプロイ後) — `/label2id` への載せ替え。`@types/api.d.ts`、`LabelToIdTable.tsx`、`LabelToId.tsx`
- **Phase 2** (#152 マージ・デプロイ後) — GRASP の `/grasp` 経由化と環境変数の整理

各フェーズの入口で、dev API (`https://api.togoid.dbcls.jp.il3c.com`) への疎通を curl で確認してから着手する。2026-08-04 時点では両エンドポイントとも 404 であり、着手できない。

## 検証

このリポジトリにはテストランナーがない。`next.config.ts` の `typescript.ignoreBuildErrors: true` によりビルドは型エラーを素通しするため、型検査は別途走らせる。

必須:

- `yarn lint`
- `npx tsc --noEmit`
- `yarn build2`

デプロイ後の手動確認:

- ncbigene (SPARQList 系) — Symbol 列が出て Score 列が出ないこと、species 指定が効くこと
- chebi (PubDictionaries 系) — Name と Score が出ること、synonym ヒットの代表名が引けること (例: `glucose` → `D-glucopyranose`)
- 閾値スライダが結果に反映されること
- "Include unmatched labels" で未マッチ行が出ること
- Convert IDs / Copy to Clipboard / Download as CSV / Download as TSV の 4 アクションが変更前と同じ出力になること
- 存在しないデータセット等でエラーメッセージが表示され、白画面にならないこと
- Annotation 列 (GRASP 経由) が Phase 2 の後も表示されること

## リスク

**#153 がマージされない可能性がある。** PR の説明に「不要と判断されたらこのPRだけ閉じてください」とあり、提案として出されている。Phase 1 は #153 に全面的に依存するため、閉じられた場合はこの設計の大半が無効になる。Phase 2 (#152 依存) は独立して実施できる。

**Amplify の環境変数はコンソール作業が必要。** `output: "export"` の静的エクスポートであり、環境変数はビルド時に埋め込まれる。`NEXT_PUBLIC_GRASP_ENDPOINT` の削除はリポジトリの変更だけでは完結せず、Amplify 側の設定からも外す必要がある。
