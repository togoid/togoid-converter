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
