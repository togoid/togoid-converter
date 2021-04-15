const fs = require("fs"),
  path = require("path"),
  yaml = require("js-yaml");
const dir = "../togoid-config/config/";

const configs = {};

const walk = function (p, fileCallback, errCallback) {
  fs.readdir(p, function (err, files) {
    if (err) {
      errCallback(err);
      return;
    }

    files.forEach(function (f) {
      const fp = path.join(p, f); // to full-path
      if (f === "dataset.yaml") {
        fs.writeFileSync(
          "../public/dataset.json",
          JSON.stringify(yaml.load(fs.readFileSync(fp, "utf8")), null, 2)
        );
        return;
      }
      if (fs.statSync(fp).isDirectory()) {
        walk(fp, fileCallback); // ディレクトリなら再帰
      } else if (fs.statSync(fp).isFile() && /.*\.yaml/.test(fp)) {
        configs[path.basename(p)] = fileCallback(fp);
      }
    });
  });
};

walk(
  dir,
  function (filePath) {
    try {
      return yaml.load(fs.readFileSync(filePath, "utf8"));
    } catch (err) {
      console.error(err.message);
    }
  },
  function (err) {
    console.log("Receive err:" + err); // エラー受信
  }
);

setTimeout(function () {
  fs.writeFileSync("../public/config.json", JSON.stringify(configs, null, 2));
}, 5000);
