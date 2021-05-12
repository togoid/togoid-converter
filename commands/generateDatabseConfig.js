const fs = require("fs"),
  path = require("path"),
  yaml = require("js-yaml");
  fetch = require("node-fetch");
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
        const jsonObject = yaml.load(fs.readFileSync(fp, "utf8"));
        Object.keys(jsonObject).forEach(key => {
          fetch("https://integbio.jp/rdf/sparql", {
            "headers": {
              "accept": "application/sparql-results+json",
            "content-type": "application/x-www-form-urlencoded",
            },
            "body": `query=PREFIX%20dcterms%3A%20%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%0APREFIX%20db%3A%20%3Chttp%3A%2F%2Fpurl.jp%2Fbio%2F03%2Fdbcatalog%2F%3E%0Aprefix%20rdfs%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0Aprefix%20dcat%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23%3E%0ASELECT%20%3Fid%20%20%3Fdb_name_ja%20%20%3Fdescription_ja%20%3Forganization_label_ja%0AFROM%20%3Chttp%3A%2F%2Frdf.integbio.jp%2Fdataset%2Fdbcatalog%2Fmain%3E%0AWHERE%0A%7B%0A%20values%20%3Fdb%20%7Bdb%3A${jsonObject[key]["catalog"]}%7D%0A%20%20%20%3Fdb%20a%20dcat%3ADataset%20%3B%0A%20%20%20dcterms%3Aidentifier%20%3Fid%20%3B%0A%20%20%20dcterms%3Atitle%20%3Fdb_name_ja%20%3B%0A%20%20%20%20%20%20dcterms%3Adescription%20%3Fdescription_ja%20%3B%0A%20%20%20%20%20%20dcterms%3Apublisher%20%2F%20rdfs%3Alabel%20%3Forganization_label_ja%20.%0A%20FILTER%20(lang(%3Fdb_name_ja)%20%3D%20%22ja%22%20)%0A%20FILTER%20(lang(%3Fdescription_ja)%20%3D%20%22ja%22%20)%0A%20FILTER%20(lang(%3Forganization_label_ja)%20%3D%20%22ja%22%20)%0A%7D`,
            "method": "POST",
          })
          .then(response => response.json())
          .then(data => {
            jsonObject[key]["name"] = data["results"]["bindings"][0]["db_name_ja"]["value"]
            jsonObject[key]["description"] = data["results"]["bindings"][0]["description_ja"]["value"]
            jsonObject[key]["organization"] = data["results"]["bindings"][0]["organization_label_ja"]["value"]
          })         
        })
        setTimeout(function () {
          fs.writeFileSync(
            "../public/dataset.json",
            JSON.stringify(jsonObject, null, 2)
          );
        }, 5000);
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
