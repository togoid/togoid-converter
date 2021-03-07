import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import axios from 'axios'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const idPatterns = {
  // 'ncbigene': {
  //   label: "NCBI Gene",
  //   regexp: "^\\d+$",
  // },
  // 'RefSeq(未)': {
  //   label: "RefSeq",
  //   regexp: "^(((AC|AP|NC|NG|NM|NP|NR|NT|NW|XM|XP|XR|YP|ZP)_\d+)|(NZ\_[A-Z]{2,4}\d+))(\.\d+)?$"
  // },
  'ensembl.gene': {
    label: 'Ensembl (ENSG)',
    regexp: '^((ENSG\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$',
  },
  'ensembl.transcript': {
    label: 'Ensembl (ENST)',
    regexp: '^((ENST\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$',
  },
  'kegg.genes': {
    label: 'KEGG Genes',
    regexp: '^\w+:[\w\d\.-]*$',
  },
  'hgnc': {
    label: 'HGNC',
    regexp: '^((HGNC|hgnc):)?\\d{1,5}$',
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
    label: 'dbSNP',
    regexp: '^rs\d+$',
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
    label: '\tClinVar Variant',
    regexp: '^\d+$',
  },
  'uniprot': {
    label: 'UniProt Knowledgebase',
    regexp: '^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$',
  },
  'ensembl.protein': {
    label: 'Ensembl (ENSP)',
    regexp: '^((ENSP\\d{11}(\\.\\d+)?)|(FB\\w{2}\\d{7})|(Y[A-Z]{2}\\d{3}[a-zA-Z](\\-[A-Z])?)|([A-Z_a-z0-9]+(\\.)?(t)?(\\d+)?([a-z])?))$',
  },
  'ncbiprotein': {
    label: 'NCBI Protein',
    regexp: '^(\w+\d+(\.\d+)?)|(NP_\d+)$',
  },
  'pdb': {
    label: 'Protein Data Bank',
    regexp: '^[0-9][A-Za-z0-9]{3}$',
  },
  'interpro': {
    label: 'InterPro',
    regexp: '^IPR\d{6}$',
  },
  'pfam': {
    label: 'Pfam',
    regexp: '^PF\d{5}$',
  },
  'intact': {
    label: 'IntAct',
    regexp: '^EBI\-[0-9]+$',
    // },
    // 'HINT(未)': {
    //   label: "HINT",
    //   regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?\-([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
    // },
    // 'Instruct(未)': {
    //   label: "Instruct",
    //   regexp: "^([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?\-([A-N,R-Z][0-9]([A-Z][A-Z, 0-9][A-Z, 0-9][0-9]){1,2})|([O,P,Q][0-9][A-Z, 0-9][A-Z, 0-9][A-Z, 0-9][0-9])(\.\d+)?$"
  },
}

const q = async (tableName, ids) => {
  return axios.get(process.env.NEXT_PUBLIC_SPARQL_ENDOPOINT + '/' + tableName.replace('.', '_') + '/' + ids.join(',')).then((d) => {
    return d.data
  }).catch(e => console.log(e))
}

const Home = () => {
  const [pullMenuStatus, setPullMenuStatus] = useState(false)
  const [inputStatus, setInputStatus] = useState(0)
  const [inputText, setInputText] = useState('')
  const [namespaceList, setNamespaceList] = useState([])
  const [selectedNamespace, setSelectedNamespace] = useState([])
  const [modalStatus, setModalStatus] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [modalData, setModalData] = useState({ heading: [], rows: [] })
  const [clippedText, setClippedText] = useState('')
  const [copied, setCopied] = useState(false)

  /**
   * 選択されたnameSpaceがstatusにセットされたら、クエリを実行する
   */
  useEffect(() => {
    if (selectedNamespace.length > 0) {
      const namespace = namespaceList[currentIndex].find(namespace => namespace.name === selectedNamespace[currentIndex])
      executeQuery(namespace)
    }
  }, [selectedNamespace])
  /**
   * modalDataがstatusにセットされたら、データモーダルを表示する
   */
  useEffect(() => {
    if (modalData.rows.length > 0) setModalStatus(!modalStatus)
  }, [modalData])
  useEffect(() => {
    if (modalStatus) setCopied(false)
  }, [modalStatus])
  /**
   * inputTextに入力されたIDまたはIDリストをidPatternsから正規表現で検索
   */
  const matchPattern = () => {
    if (inputText === '') return
    const ids = inputText.split(/[\s,\n]+/).map(v => v.trim())
    const convertResults = []
    ids.forEach(id => {
      for (let key in idPatterns) {
        if (id.match(idPatterns[key].regexp)) {
          const index = convertResults.findIndex(namespaceList => namespaceList.name === key)
          if (index === -1) {
            convertResults.push({ name: key, count: 1, ids: [id], hasMenu: false })
          } else {
            convertResults[index].count += 1
            convertResults[index].ids.push(id)
          }
        }
      }
    })
    if (convertResults && convertResults.length > 0) {
      convertResults.sort(function (a, b) {
        if (a.count < b.count) return 1
        if (a.count > b.count) return -1
        return 0
      })
      const namespaceList = convertResults.map(v => {
        return { name: v.name, count: v.count, hasMenu: false, ids: v.ids.map(id => {return { to: id }}) }
      })
      setNamespaceList([namespaceList])
      setSelectedNamespace([namespaceList[0].name])
    }
  }

  const executeQuery = async (namespaceInfo) => {
    // TODO クエリ実行中にloading画面を表示させる
    const newNamespaceList = JSON.parse(JSON.stringify(namespaceList))
    const d = await q(namespaceInfo.name, namespaceInfo.ids.map(v => v.to))
    if (d) {
      const convertResults = []
      d.result.forEach(v => {
        const index = convertResults.findIndex(pref => pref.name === v.tn)
        if (index === -1) {
          convertResults.push({
            name: v.tn, count: 1, hasMenu: false, ids: [{ from: v.f, to: v.t }],
          })
        } else {
          convertResults[index].count += 1
          convertResults[index].ids.push({ from: v.f, to: v.t })
        }
      })
      convertResults.sort(function (a, b) {
        if (a.count < b.count) return 1
        if (a.count > b.count) return -1
        return 0
      })
      newNamespaceList.push(convertResults)
      setNamespaceList(newNamespaceList)
    }
  }
  /**
   * 表示されているリストをクリアする
   */
  const clearList = () => {
    setNamespaceList([])
    setSelectedNamespace([])
    setCurrentIndex(0)
  }
  /**
   * Executeボタン押下
   * @param event
   */
  const handleSubmit = (event) => {
    event.preventDefault()
    clearList()
    matchPattern()
  }
  /**
   * namespaceのラジオボタンを選択する
   * @param name　選択されたnamespace
   * @param index　選択されたnamespaceの階層番号
   */
  const selectNamespace = (name, index) => {
    setCurrentIndex(index)
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
  /**
   * ３点リーダサブメニューの表示非表示を切り替える
   * @param index1
   * @param index2
   */
  const toggleHasMenu = (index1, index2) => {
    const newNamespaceList = JSON.parse(JSON.stringify(namespaceList))
    let newNamespace = newNamespaceList[index1]
    newNamespace[index2].hasMenu = !newNamespace[index2].hasMenu
    setNamespaceList(newNamespaceList)
  }
  /**
   * モーダルの表示非表示を切り替える
   * 　モーダルを表示する際に３点リーダサブメニューを閉じる
   * @param index1
   * @param index2
   */
  const showModal = (index1, index2) => {
    toggleHasMenu(index1, index2)
    const results = []
    const headings = []
    namespaceList.forEach((v, i) => {
      if (i <= index1) {
        const data = v.filter(v2 => {
          if (v2.name === selectedNamespace[i]) {
            return v2
          }
        })
        results.push(data[0].ids)
        headings.push(data[0].name)
      }
    })
    let arrList = []
    let newArrayList = []
    results.forEach((rows, i) => {
      rows.forEach((v) => {
        if (i === 1) {
          // 2列目はsとoで1列目と2列目のリストを追加
          arrList.push([v.from, v.to])
        } else if (i > 1) {
          // 3列目以降は列または行追加
          arrList.forEach(row => {
            let colIndex = row.indexOf(v.from)
            if (colIndex >= 0) {
              const newRow = row.filter((v, i) => i <= colIndex)
              newArrayList.push(newRow.concat(v.to))
            }
          })
        }
      })
      if (i >= 2) arrList = newArrayList
    })
    setModalData({ headings: headings, rows: arrList })
    setClippedText(createClippedText(arrList))
  }

  const createClippedText = (array) => {
    let text = ''
    array.forEach((v, i) => {
      if (i > 0) {
        text = text.concat('\n')
      }
      text = text.concat(v[v.length - 1])
    })
    console.log(text)
    return text
  }

  const exportCSV = () => {
    // todo カンマが万一データに混ざっていたときのために、csv生成用のライブラリを用いる。また見出し行をmodalData.headingsから取得する
    let data = modalData.rows.map((record) => record.join(',')).join('\r\n')
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF])
    let blob = new Blob([bom, data], { type: 'text/csv' })
    let url = (window.URL || window.webkitURL).createObjectURL(blob)
    let link = document.createElement('a')
    link.download = 'result.csv'
    link.href = url
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="home">
      <Head>
        <title>Togo ID</title>
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
                                {i > 0 && selectedNamespace[i] === v.name ?
                                  <button className="radio__three_dots" onClick={() => toggleHasMenu(i, j)}/> : null}
                                {v.hasMenu ? (
                                  <div className="button_pull_down__children">
                                    <button className="button_pull_down__children__item" onClick={() => showModal(i, j)}>
                                      <svg className="icon" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8V5H4M4,19H8V15H4M4,14H8V10H4V14Z"/>
                                      </svg>
                                      Resolve with this
                                    </button>
                                  </div>
                                ) : ('')
                                }
                              </div>
                            </li>
                          })
                          }
                        </ul>
                        {i < namespaceList.length - 1 ?
                          <React.Fragment>
                            <div className="point"/>
                            <select name="" id="" className="select white">
                              <option value="">rdfs:seeAlso</option>
                            </select>
                            <div className="point"/>
                          </React.Fragment>
                          : null}
                      </div>
                    })
                    : null
                  }

                  {/* Modal */}
                  {
                    modalStatus ? (
                      <div className="modal">
                        <div className="modal__inner">
                          <div className="modal__scroll_area">
                            <button onClick={() => setModalStatus(!modalStatus)} className="modal__close">
                              <svg viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                              </svg>
                            </button>
                            <h2 className="title">ID forwarding</h2>
                            <div className="modal__top">

                              <div className="option">
                                <p className="label">Option</p>
                                <select name="" id="" className="select white">
                                  <option value="id">ID</option>
                                </select>
                              </div>

                              <div className="item_wrapper">
                                <div className="input_search">
                                  <svg className="input_search__icon" viewBox="0 0 24 24">
                                    <path fill="currentColor"
                                          d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                                  </svg>
                                  <input type="search" className="input_search__input"/>
                                </div>
                                {copied ? <span>Copied.</span> : null}
                                <CopyToClipboard text={clippedText} onCopy={() => setCopied(true)}>
                                  <button className="button_icon">
                                    <svg className="button_icon__icon" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                                    </svg>
                                    <span className="button_icon__label">copy</span>
                                  </button>
                                </CopyToClipboard>
                                <button className="button_icon" onClick={() => exportCSV()}>
                                  <svg className="button_icon__icon" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                                  </svg>
                                  <span className="button_icon__label">エクスポート</span>
                                </button>
                              </div>

                            </div>
                            <table className="table">
                              <thead>
                              <tr>
                                {modalData && modalData.headings.length > 0 ? modalData.headings.map((v, i) => {
                                  return <th key={i}>{v}</th>
                                }) : null}
                              </tr>
                              </thead>
                              <tbody>
                              {modalData && modalData.rows.length > 0 ? modalData.rows.map((data, i) => {
                                return <tr key={i}>
                                  {data.map((d, j) => {
                                    return <td key={j}>{d}</td>
                                    {/*   <td>*/}
                                    {/*      <ul className="buttons">*/}
                                    {/*        <li>*/}
                                    {/*          <button className="button_small green">NCBI Gene</button>*/}
                                    {/*        </li>*/}
                                    {/*        <li>*/}
                                    {/*          <button className="button_small white">rdfs:seeAlso</button>*/}
                                    {/*        </li>*/}
                                    {/*      </ul>*/}
                                    {/*    </td>*/}
                                  })}
                                </tr>
                              }) : null}
                              </tbody>
                            </table>
                            <button className="button_more">MORE</button>
                          </div>
                        </div>
                      </div>
                    ) : ('')
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
