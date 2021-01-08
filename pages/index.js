import Head from 'next/head'
import React, { useState, useEffect } from "react";
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  const [pullMenuStatus, setPullMenuStatus] = useState(false);
  const [tabStatus, setTabStatus] = useState('EXPLORE');
  const [inputStatus, setInputStatus] = useState(0)
  const [inputText, setInputText] = useState('');
  const [ids, setIds] = useState([]);
  
  useEffect(() => {
    const splitText = inputText.split('\n')
    setIds(splitText);
  }, [inputText]);
  
  const handleSubmit = (event) => {
    event.preventDefault()
    // TODO idを特定、検索、EXPLOREエリアにセット
  }
  
  return (
    <div className="home">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
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

          <div className="textarea">
            <form onSubmit={handleSubmit}>
              <textarea cols="30" rows="10" placeholder="Enter IDs" className="textarea__input"
                        value={inputText} onChange={(e) => setInputText(e.target.value)}/>
              <input type="submit" value="EXECUTE" className="button_large"/>
            </form>
          </div>
        </div>

        <div className="drawing_area">
          <div className="tab_wrapper">
            <button
              onClick={() => setTabStatus("EXPLORE")}
              className={tabStatus === "EXPLORE" ? "button_tab active" : "button_tab"}>
              EXPLORE
            </button>
            <button
              onClick={() => setTabStatus("DATA")}
              className={tabStatus === "DATA" ? "button_tab active" : "button_tab"}>
              DATA
            </button>
          </div>

          <div className="panel">
            <div className="panel__button">
              {tabStatus === "DATA" ? (
                <div className="input_search">
                  <svg className="input_search__icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                  </svg>
                  <input type="search" className="input_search__input"/>
                </div>
              ) : (
                ""
              )}
              <div className="button_pull_down__wrapper">
                <button
                  onClick={() => setPullMenuStatus(!pullMenuStatus)}
                  className={pullMenuStatus ? "button_pull_down active" : "button_pull_down" }>
                  Operation
                </button>
                {pullMenuStatus ?
                  (
                    <div className="button_pull_down__children">
                      <button className="button_pull_down__children__item">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                        Export as CSV
                      </button>
                      <button className="button_pull_down__children__item">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z" />
                        </svg>
                        Reset
                      </button>
                    </div>
                  ) : (
                    ""
                )}
              </div>
            </div>
            <div className="panel__inner">
              {tabStatus === "DATA" ? (
                <table className="data">
                  <thead>
                  <tr>
                    <th>NCBI Gene</th>
                    <th>xxx</th>
                    <th>HGNC</th>
                    <th>xxx</th>
                    <th>yyy</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                  </tr>
                  <tr>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                  </tr>
                  <tr>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                    <td>xxx-xxx-xxxx</td>
                  </tr>
                  </tbody>
                </table>
              ) : (
                <div className="explore">
                  <div className="drawing">
                    <div className="item_wrapper">
                      <select name="" id="" className="select green">
                        <option value="">NCBI Gene</option>
                      </select>
                      <div className="point"/>
                    </div>

                    <div className="item_wrapper">
                      <select name="" id="" className="select white">
                        <option value="">rdfs:seeAlso</option>
                      </select>
                      <div className="point"/>
                    </div>

                    <div className="result_wrapper">
                      <ul className="result_list">
                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result01" className="checkbox__input"/>
                            <label htmlFor="result01" className="checkbox__large_label green">HGNC</label>
                          </div>
                        </li>

                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result02" className="checkbox__input"/>
                            <label htmlFor="result02" className="checkbox__large_label green">xxx</label>
                          </div>
                        </li>

                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result03" className="checkbox__input"/>
                            <label htmlFor="result03" className="checkbox__large_label purple">yyy</label>
                          </div>
                        </li>

                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result04" className="checkbox__input"/>
                            <label htmlFor="result04" className="checkbox__large_label orange">zzz</label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="drawing">
                    <div className="item_wrapper">
                      <select name="" id="" className="select green">
                        <option value="">NCBI Gene</option>
                      </select>
                      <div className="point"/>
                    </div>
                    <div className="item_wrapper">
                      <select name="" id="" className="select white">
                        <option value="">rdfs:seeAlso</option>
                      </select>
                      <div className="point"/>
                    </div>
                    <div className="result_wrapper">
                      <ul className="result_list">
                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result01" className="checkbox__input"/>
                            <label htmlFor="result01" className="checkbox__large_label green">HGNC</label>
                          </div>
                        </li>
                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result02" className="checkbox__input"/>
                            <label htmlFor="result02" className="checkbox__large_label green">xxx</label>
                          </div>
                        </li>
                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result03" className="checkbox__input"/>
                            <label htmlFor="result03" className="checkbox__large_label purple">yyy</label>
                          </div>
                        </li>
                        <li>
                          <div className="point"/>
                          <div className="checkbox">
                            <input type="checkbox" id="result04" className="checkbox__input"/>
                            <label htmlFor="result04" className="checkbox__large_label orange">zzz</label>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
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
