const fs = require("fs"),
  path = require("path");
const dir = "../togoid-config/config/";

const configs = {};

/* 完成イメージ
const configs = {
  "affy_probeset-ncbigene": {
    link: {
      forward: {
        label: "seeAlso",
      },
      reverse: {
        label: "seeAlso",
      },
    },
    update: {
      frequency: "freeze",
      method: "sparql_csv2tsv.sh query.rq https://orth.dbcls.jp/sparql-dev",
    },
  },
  "chembl_compound-chebi": {
    link: {
      forward: {
        label: "seeAlso",
      },
      reverse: {
        label: "seeAlso",
      },
    },
    update: {
      frequency: "freeze",
      method: "sparql_csv2tsv.sh query.rq https://orth.dbcls.jp/sparql-dev",
    },
  },
};
*/

const walk = function (p, fileCallback, errCallback) {
  fs.readdir(p, function (err, files) {
    if (err) {
      errCallback(err);
      return;
    }

    files.forEach(function (f) {
      const fp = path.join(p, f); // to full-path
      if (fs.statSync(fp).isDirectory()) {
        walk(fp, fileCallback); // ディレクトリなら再帰
      } else if (fs.statSync(fp).isFile() && /.*\.yaml/.test(fp)) {
        // todo yamlを読み込んでJSのオブジェクトに変換し、configsに格納
        fileCallback(fp); // ファイルならコールバックで通知
      }
    });
  });
};

// 使う方
walk(
  dir,
  function (path) {
    console.log(path); // ファイル１つ受信
  },
  function (err) {
    console.log("Receive err:" + err); // エラー受信
  }
);

// todo configsに蓄積したオブジェクトをJSONにして、public配下にconfig.jsonのファイル名で保存