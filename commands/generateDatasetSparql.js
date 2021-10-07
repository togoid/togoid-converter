const fs = require("fs"),
  path = require("path"),
  yaml = require("js-yaml");
const fetch = require("node-fetch");
const dir = "../togoid-config/config/";

const walk = function (p, fileCallback, errCallback) {
  fs.readdir(p, function (err, files) {
    if (err) {
      errCallback(err);
      return;
    }

    files.forEach(function (f) {
      if (f === "dataset.yaml") {
        const fp = path.join(p, f); // to full-path
        const jsonObject = yaml.load(fs.readFileSync(fp, "utf8"));
        const sparqleObject = {};
        Object.keys(jsonObject).forEach((key) => {
          fetch("https://integbio.jp/togosite/sparql", {
            headers: {
              accept: "application/sparql-results+json",
              "content-type": "application/x-www-form-urlencoded",
            },
            body: `query=PREFIX+dcterms%3A+%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%0D%0APREFIX+db%3A+%3Chttp%3A%2F%2Fpurl.jp%2Fbio%2F03%2Fdbcatalog%2F%3E%0D%0Aprefix+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0Aprefix+dcat%3A+%3Chttp%3A%2F%2Fwww.w3.org%2Fns%2Fdcat%23%3E%0D%0ASELECT+%3Fid++%3Fdb_name_ja++%3Fdescription_ja+%3Forganization_label_ja+%3Fdescription_en+%3Forganization_label_en%0D%0AFROM+%3Chttp%3A%2F%2Frdf.integbio.jp%2Fdataset%2Ftogosite%2Fdbcatalog%2Fmain%3E%0D%0AWHERE%0D%0A%7B%0D%0A+values+%3Fdb+%7Bdb%3A${jsonObject[key]["catalog"]}%7D%0D%0A+++%3Fdb+a+dcat%3ADataset+%3B%0D%0A+++dcterms%3Aidentifier+%3Fid+%3B%0D%0A+++dcterms%3Atitle+%3Fdb_name_ja+%3B%0D%0A++++++dcterms%3Adescription+%3Fdescription_ja+%3B%0D%0A++++++dcterms%3Apublisher+%2F+rdfs%3Alabel+%3Forganization_label_ja+%3B%0D%0A++++++dcterms%3Adescription+%3Fdescription_en+%3B%0D%0A++++++dcterms%3Apublisher+%2F+rdfs%3Alabel+%3Forganization_label_en+.%0D%0A+FILTER+%28lang%28%3Fdb_name_ja%29+%3D+%22ja%22+%29%0D%0A+FILTER+%28lang%28%3Fdescription_ja%29+%3D+%22ja%22+%29%0D%0A+FILTER+%28lang%28%3Forganization_label_ja%29+%3D+%22ja%22+%29%0D%0A+FILTER+%28lang%28%3Fdescription_en%29+%3D+%22en%22+%29%0D%0A+FILTER+%28lang%28%3Forganization_label_en%29+%3D+%22en%22+%29%0D%0A%7D`,
            method: "POST",
          })
            .then((response) => response.json())
            .then((data) => {
              sparqleObject[key] = {};
              sparqleObject[key]["name"] =
                data["results"]["bindings"][0]["db_name_ja"]["value"];
              sparqleObject[key]["description_ja"] =
                data["results"]["bindings"][0]["description_ja"]["value"];
              sparqleObject[key]["description_en"] =
                data["results"]["bindings"][0]["description_en"]["value"];
              sparqleObject[key]["organization_ja"] =
                data["results"]["bindings"][0]["organization_label_ja"][
                  "value"
                ];
              sparqleObject[key]["organization_en"] =
                data["results"]["bindings"][0]["organization_label_en"][
                  "value"
                ];
            });
        });
        setTimeout(function () {
          fs.writeFileSync(
            "../public/datasetSparql.json",
            JSON.stringify(sparqleObject, null, 2)
          );
        }, 5000);
        return;
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
