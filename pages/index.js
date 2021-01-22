import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import axios from 'axios'

const idPatterns = {
  'ncbigene': {
    label: "NCBI Gene",
    regexp: "^\\d+$",
  },
  // 'RefSeq(未)': {
  //   label: "RefSeq",
  //   regexp: "^(((AC|AP|NC|NG|NM|NP|NR|NT|NW|XM|XP|XR|YP|ZP)_\d+)|(NZ\_[A-Z]{2,4}\d+))(\.\d+)?$"
  // },
  // 'Ensembl (ENSG)(未)': {
  //   label: "Ensembl (ENSG)",
  //   regexp: "^((ENSG\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$"
  // },
  // 'Ensembl (ENST)(未)': {
  //   label: "Ensembl (ENST)",
  //   regexp: "^((ENST\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$"
  // },
  'kegg.genes': {
    label: "KEGG Genes",
    regexp: "^\w+:[\w\d\.-]*$"
  },
  'hgnc': {
    label: "HGNC",
    regexp: "^((HGNC|hgnc):)?\\d{1,5}$",
  },
  // 'Gene Ontology(未)': {
  //   label: "Gene Ontology",
  //   regexp: "^GO:\d{7}$"
  // },
  // 'TogoVar(未)': {
  //   label: "TogoVar",
  //   regexp: "^tgv\d+$"
  // },
  'dbsnp': {
    label: "dbSNP",
    regexp: "^rs\d+$"
  },
  // 'dbVar(未)': {
  //   label: "dbVar",
  //   regexp: "^nstd\d+$"
  // },
  // 'gnomAD(未)': {
  //   label: "gnomAD",
  //   regexp: "^(\d+|X|Y)-\d+-[ATGC]+-[ATGC]+$"
  // },
  'clinvar': {
    label: "\tClinVar Variant",
    regexp: "^\d+$"
  },
  'uniprot': {
    label: "UniProt Knowledgebase",
    regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
  },
  // 'Ensembl (ENSP)(未)': {
  //   label: "Ensembl (ENSP)",
  //   regexp: "^((ENSP\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$"
  // },
  'ncbiprotein': {
    label: "NCBI Protein",
    regexp: "^(\w+\d+(\.\d+)?)|(NP_\d+)$"
  },
  'pdb': {
    label: "Protein Data Bank",
    regexp: "^[0-9][A-Za-z0-9]{3}$"
  },
  'interpro': {
    label: "InterPro",
    regexp: "^IPR\d{6}$"
  },
  'pfam': {
    label: "Pfam",
    regexp: "^PF\d{5}$"
  },
  'intact': {
    label: "IntAct",
    regexp: "^EBI\-[0-9]+$"
  // },
  // 'HINT(未)': {
  //   label: "HINT",
  //   regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?\-([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
  // },
  // 'Instruct(未)': {
  //   label: "Instruct",
  //   regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?\-([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
  }
};

const q = (q) => {
  return axios.get(process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT, {
    params: {
      query: q,
      format: 'application/sparql-results+json',
    },
  }).then((d) => {
    return d.data.results.bindings
  })
}

const Home = () => {
  const [pullMenuStatus, setPullMenuStatus] = useState(false)
  const [inputStatus, setInputStatus] = useState(0)
  const [inputText, setInputText] = useState('')
  // const [ids, setIds] = useState([])
  const [namespaceList, setNamespaceList] = useState([])
  const [selectedNamespace, setSelectedNamespace] = useState([])
  const [executed, setExecuted] = useState(false)

  useEffect(() => {
    setNamespaceList([])
    setSelectedNamespace([])
    setExecuted(false)
  }, [inputText])

  useEffect(() => {
    // １回目だけ(setStateのタイミングがわからないので)
    if (selectedNamespace.length === 1 && !executed) {
      console.log(namespaceList[0])
      const namespace = namespaceList[0].filter(namespace => namespace.name === selectedNamespace[0])
      executeQuery(namespace[0])
      setExecuted(true)
    }
  }, [selectedNamespace, executed])

  const matchPattern = () => {
    if (inputText === '') return
    let ids = inputText.split('\n')
    const patternArray = []
    ids.forEach(id => {
      for (let key in idPatterns) {
        if (id.match(idPatterns[key].regexp)) {
          let index = patternArray.findIndex(namespaceList => namespaceList.name === key)
          if (index >= 0) {
            patternArray[index].value +=1
          } else {
            patternArray.push({name: key, value: 1, ids: [id]})
          }
        }
      }
    })
    if (patternArray && patternArray.length > 0) {
      patternArray.sort(function(a,b){
        if(a.value < b.value) return 1
        if(a.value > b.value) return -1
        return 0
      });
      setNamespaceList([patternArray])
      console.log(patternArray)
      setSelectedNamespace([patternArray[0].name])
    }
    return patternArray
  }

  const executeQuery = (namespaceInfo) => {
    // 現時点では、ids[0]のみを対象に検索で良い
    // idPatternsのキーが名前空間となる。これとIDを組み合わせて、identifiers.orgのURIを合成する
    // 接頭辞(ncbigene:など)がない場合には、これを補う
    // 例1) 	https://identifiers.org/ncbigene:100010
    // 例2) 	https://identifiers.org/hgnc:2674

    const namespace = namespaceInfo.name
    const id = namespaceInfo.ids[0]
    console.log(namespaceList)
    q(`select * where {
  <http://identifiers.org/${namespace}/${id}> rdfs:seeAlso ?o
 }`).then((results) => {
      const newNamespaceList = JSON.parse(JSON.stringify(namespaceList))
      const prefArray = []
      results.forEach(v => {
        if (v.o.value.match(/^http?:\/\/identifiers.org/)) {
          let splitArray = v.o.value.replace('http://identifiers.org/', '').split('/')
          let name = splitArray[0]
          let id = splitArray[1]
          let index = prefArray.findIndex(pref => pref.name === name)
          if (index >= 0) {
            prefArray[index].value +=1
            prefArray[index].ids.push(id)
          } else {
            prefArray.push({name: name, value: 1, ids: [id]})
          }
        }
      })
      prefArray.sort(function(a,b){
        if(a.value < b.value) return 1
        if(a.value > b.value) return -1
        return 0
      });
      newNamespaceList.push(prefArray)
      console.log(newNamespaceList)
      setNamespaceList(newNamespaceList)
      // TODO 分類の色を持たせる
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const res = matchPattern()
    executeQuery(res[0])
  }

  const selectNamespace = (name, index) => {
    let array = JSON.parse(JSON.stringify(selectedNamespace))
    let newNamespaceList = JSON.parse(JSON.stringify(namespaceList))
    if (array.length - 1 >= index) {
      array[index] = name
      // 変更したら、それ以下のリストを削除
      if (array.length - 1 > index) {
        array.splice(index + 1, array.length - (index + 1))
      }
      if (newNamespaceList.length - 1 > index) {
        newNamespaceList.splice(index + 1, newNamespaceList.length - (index + 1))
      }
    } else {
      array.push(name)
    }
    setSelectedNamespace(array)
    setNamespaceList(newNamespaceList)
  }

  return (
    <div className="home">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <Header/>

      <main className="main">
        <div className="input_area">
          <div className="radio_wrapper">
            <div className="radio">
              <input type="radio" id="textField" name="input_type" className="radio__input"
                     checked={inputStatus === 0} onChange={() => setInputStatus(0)}/>
              <label htmlFor="textField" className="radio__label">INPUT from text field</label>
            </div>

            <div className="radio">
              <input type="radio" id="csv" name="input_type" className="radio__input"
                     checked={inputStatus === 1} onChange={() => setInputStatus(1)}/>
              <label htmlFor="csv" className="radio__label">INPUT from CSV</label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="textarea">
            <textarea cols="30" rows="10" placeholder="Enter IDs" className="textarea__input"
                      value={inputText} onChange={(e) => setInputText(e.target.value)}/>
            <input type="submit" value="EXECUTE" className="button_large"/>
          </form>
        </div>

        <div className="drawing_area">
          <div className="panel">
            <div className="panel__button">
              <div className="button_pull_down__wrapper">
                <button
                  onClick={() => setPullMenuStatus(!pullMenuStatus)}
                  className={pullMenuStatus ? 'button_pull_down active' : 'button_pull_down'}>
                  Operation
                </button>
                {pullMenuStatus ?
                  (
                    <div className="button_pull_down__children">
                      <button className="button_pull_down__children__item">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                        </svg>
                        Export as CSV
                      </button>
                      <button className="button_pull_down__children__item">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path fill="currentColor"
                                d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"/>
                        </svg>
                        Reset
                      </button>
                    </div>
                  ) : (
                    ''
                  )}
              </div>
            </div>
            <div className="panel__inner">
              <div className="explore">
                <div className="drawing">
                  {namespaceList && namespaceList.length > 0 ? namespaceList.map((namespace, i) => {
                    return <div className="item_wrapper" key={i}>
                      <ul className="result_list">
                        {namespace.map((v, j) => {
                            return <li key={j}>
                              <div className="radio green">
                                <input type="radio" id={`result${i}-${j}`} className="radio__input"
                                       checked={selectedNamespace[i] === v.name} onChange={() => selectNamespace(v.name, i)}/>
                                <label htmlFor={`result${i}-${j}`} className="radio__large_label green">
                                  <span className="radio__large_label__inner">
                                    <img src="/images/icon_rat.png" alt="アイコン画像：ラット" className="icon"/>
                                    {v.name}
                                  </span>
                                </label>
                                {selectedNamespace[i] === v.name ? <button onClick={() => executeQuery(v)} className="radio__three_dots"/> : null}
                                <div className="button_pull_down__children">
                                  <button className="button_pull_down__children__item">
                                    <svg className="icon" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" />
                                    </svg>
                                    Forward via this
                                  </button>
                                  <button className="button_pull_down__children__item">
                                    <svg className="icon" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z" />
                                    </svg>
                                    Resolve with this
                                  </button>
                                </div>
                              </div>
                            </li>
                          })
                        }
                      </ul>
                      <div className="point"/>
                      <select name="" id="" className="select white">
                        <option value="">rdfs:seeAlso</option>
                      </select>
                      <div className="point"/>
                    </div>
                    })
                    : null
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="notice_area">
          <p className="heading">NOTICE</p>
          <p className="text">
            - Your IDs match with “NCBI Gene”<br/>
            - Relation(s) found: “HGNC”, “xxx”, “yyy”, “zzz”<br/>
            - LINE 999 “xxx-xxx-xxxx“ is not match the pattern. <br/>
            - LINE 999 “xxx-xxx-xxxx“ is not match the pattern.
          </p>
        </div>
      </main>

      <Footer/>
    </div>
  )
}

export default Home
