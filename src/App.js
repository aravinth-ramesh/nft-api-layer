import React, { useState, useEffect, useRef } from "react";
import { Container, InputGroup } from "react-bootstrap";
import img_logo from "./assets/images/Keys.png";
import img_cartoon from "./assets/images/cartoon-1.svg";
import facebook from "./assets/images/facebook.png";
import telegram from "./assets/images/telegram.png";
import github from "./assets/images/github.png";
import twitter from "./assets/images/twitter.png";
import opensea from "./assets/images/opensea.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Web3 from "web3";
import KeysToMetaverse from "../src/abis/KeyToMetaverse.json";
import { Link } from "react-router-dom";
import Web3Three from "./web3";
import { fetchUserWalletNfts } from "./isUserHasTrait";
import { supportedNetwork } from "./data";
import Select from "react-dropdown-select";

const App = (props) => {
  const [darkMode, setDarkMode] = React.useState(true);
  const icons = [
    {
      img: facebook,
      link: "https://facebook.com",
    },
    {
      img: telegram,
      link: "https://telegram.org/",
    },
    {
      img: twitter,
      link: "https://twitter.com",
    },
    {
      img: opensea,
      link: "https://opensea.io/",
    },
    {
      img: github,
      link: "https://github.com/",
    },
  ];

  const etherNetID = 1; // mainnet-  1 // test - 1

  const binanceNetID = 56; // mainnet - 56 // test = 97

  const polygonNetID = 137; // mainnet - 137 // test = 80001

  const [contractAddress, setContractAddress] = useState("");
  const [networkId, setNetworkId] = useState();
  const [network, setNetwork] = useState("");

  const [nftData, setNftData] = useState("");
  const [loading, setLoading] = useState(true);

  const [nftTraits, setNftTraits] = useState([]);

  const [activeProperty, setActiveProperty] = useState({});

  const [selectedValue, setSelectedValue] = useState([]);

  const [collectionDataTotal, setCollectionDataTotal] = useState(1);

  const [fetchStatus, setFetchStatus] = useState(true);

  const [nftFetchDataStatus, setNftFetchDataStatus] = useState(false);

  const [generateCode, setGenerateCode] = useState(false);

  const [walletAddress, setWalletAddress] = useState(null);

  const propertiesRef = useRef();

  const [selectedNetwork, setSelectedNetwork] = useState(null);

  useEffect(() => {
    if (fetchStatus && nftFetchDataStatus) {
      const delayDebounceFn = setTimeout(() => {
        fetchNftData();
      }, 1000);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [collectionDataTotal, nftFetchDataStatus, fetchStatus]);

  useEffect(() => {
    if (!fetchStatus) {
      let uniqueAttributesArray = [];
      let attributesArray = [];
      let uniqueValueArray = [];
      nftData.map((result, index) => {
        if (result.metadata != null && result.metadata) {
          let jsonFormattedString = result.metadata.replace('\\"', '"');
          let attributes = JSON.parse(jsonFormattedString).attributes.map(
            (obj) => obj
          );
          attributesArray = [...attributesArray, ...attributes];
          uniqueAttributesArray = [
            ...new Set(
              attributes.map((item, index) => {
                return { name: item.trait_type, index: index };
              })
            ),
          ];
        } else {
        }
      });
      uniqueAttributesArray.map((uniqattributes, index) => {
        let valuesArray = [];
        attributesArray.filter((item) => {
          if (uniqattributes.name === item.trait_type) {
            if (item.value) {
              valuesArray = [...valuesArray, item.value];
            }
          }
        });
        uniqueValueArray = [...new Set(valuesArray)];
        uniqueAttributesArray[index] = {
          ...uniqueAttributesArray[index],
          values: uniqueValueArray.map((uniqueValue, index) => {
            return {
              name: uniqueValue,
              index: index,
              count: valuesArray.filter((value) => value == uniqueValue).length,
            };
          }),
        };
      });
      setNftTraits(uniqueAttributesArray);
      console.log(uniqueAttributesArray);
    }
  }, [fetchStatus]);

  const fetchNftData = async () => {
    let data = await fetch(
      `https://deep-index.moralis.io/api/v2/nft/${contractAddress}?chain=${network}&format=decimal&offset=${nftData.length}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-API-Key":
            "3LgKxFRe3Tayvrus7e30okVI6vuS5xXyDOLh82OQuVKB84m0kOE2M0eEdXrQL5Bs",
        },
        method: "GET",
      }
    );
    const response = await data.json().then((result) => {
      //console.log("REs", result.result);
      setNftData([...nftData, ...result.result]);
      setLoading(false);
      let attributesArray = [];
      let uniqueAttributesArray = [];

      let uniqueValueArray = [];
      const fetchcount = Math.ceil(Number(result.total) / 500) - 1;
      const itemsCount = Math.ceil(nftData.length / 500) + 1;
      if (fetchcount > itemsCount) {
        setCollectionDataTotal((prev) => prev + 1);
      } else {
        setFetchStatus(false);
      }
      //   result.result.map((result , index) => {
      //     if(result.syncing == 2 && result.metadata != null && result.metadata){
      //      let jsonFormattedString = result.metadata.replace('\\"', '"');
      //      let attributes = JSON.parse(jsonFormattedString).attributes.map(obj => obj);
      //      attributesArray = [...attributesArray , ...attributes]
      //      uniqueAttributesArray = [...new  Set(attributes.map( (item , index) => {return{ name : item.trait_type  , index : index}} )) ]
      //     }else{

      //     }

      //   })
      //   uniqueAttributesArray.map((uniqattributes , index) => {
      //    let valuesArray = [];
      //    attributesArray.filter(item => {
      //      if(uniqattributes.name === item.trait_type){
      //        if(item.value){
      //          valuesArray = [...valuesArray , item.value]
      //        }
      //      }
      //    } )
      //    uniqueValueArray =  [...new Set(valuesArray)];
      //    uniqueAttributesArray[index] = {...uniqueAttributesArray[index] , values : uniqueValueArray.map(((uniqueValue , index )=> {return { name: uniqueValue , index : index, count : valuesArray.filter(value => value == uniqueValue).length}}))}
      //  })
      //   setNftTraits(uniqueAttributesArray)
    });
  };

  const handleActiveProperty = (property) => {
    setActiveProperty(property);
    // setSelectedValue([])
  };

  const handleSelectedValue = (value, trait) => {
    console.log(value, trait);

    // const itemExist = selectedValue.filter(
    //   (selected) => selected.trait == activeProperty.name
    // );

    const itemExist = selectedValue.filter(
      (selected) => selected.trait == trait
    );

    console.log(itemExist);

    if (itemExist.length > 0) {
      const isValueExist = itemExist[0].value.includes(value);

      const remainging_count = itemExist[0].value.filter(
        (existedValue) => existedValue != value
      ).length;
      console.log(isValueExist);
      if (remainging_count == 0) {
        const newData = selectedValue.filter(
          (properties) => properties.trait != trait
        );
        setSelectedValue(newData);
      } else {
        if (isValueExist) {
          console.log("remove item");
          const newData = selectedValue.map((properties, index) => {
            if (properties.trait === trait) {
              return {
                ...properties,
                value: properties.value.filter(
                  (existedValue) => existedValue != value
                ),
              };
            }
            return properties;
          });
          setSelectedValue(newData);
        } else {
          console.log("add item");
          const newData = selectedValue.map((properties, index) => {
            if (properties.trait === trait) {
              return { ...properties, value: [...properties.value, value] };
            }
            return properties;
          });
          setSelectedValue(newData);
        }
      }
    } else {
      let newSelected = { trait: trait, value: [value] };
      setSelectedValue([...selectedValue, newSelected]);
    }
  };

  const handleFetchDataStatus = () => {
    if (network != "" && networkId && contractAddress != "") {
      setNftFetchDataStatus(true);
      setFetchStatus(true);
      setNftTraits([]);
      setNftData([]);
      setSelectedValue([]);
      setActiveProperty({});
      setTimeout(() => {
        window.scrollTo(0, propertiesRef.current.offsetTop + 200);
      }, 1000);
    }
  };

  const [scriptTemplate, setScriptTemplate] = useState(null);

  const handleGenerateCode = async () => {
    if (network != "" && networkId.length > 0 && contractAddress != "") {
      setGenerateCode(true);
      setScriptTemplate(false);
      // setUserWalletNftData({
      //   ...userWalletNftData,
      //   fetchStatus : true
      // })

      setScriptTemplate(
        `
      <script type="module">

      import {fetchUserWalletNfts} from "${
        window.location.origin
      }/assets/isUserHasTrait.js";

      (function ($) {
        $(document).ready(async function () {
          const res = await fetchUserWalletNfts(
            "Your_wallet_address", // your wallet address
            "${contractAddress}",
            "${network}",
            ${JSON.stringify(selectedValue)}
          );
        });
      })(jQuery);

      </script>

      `
      );

      // const res = await fetchUserWalletNfts(
      //   walletAddress,
      //   contractAddress,
      //   network,
      //   selectedValue
      // );
      // console.log(res);
    }
  };

  // do not delete

  // let getNFT = await fetch(
  //   `https://deep-index.moralis.io/api/v2/${result.accounts}/nft/0xce9d0f73265c7867254e8ff445ab640674d95d23?chain=polygon&format=decimal`,
  //   {
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //       "X-API-Key":
  //         "3LgKxFRe3Tayvrus7e30okVI6vuS5xXyDOLh82OQuVKB84m0kOE2M0eEdXrQL5Bs",
  //     },
  //     method: "GET",
  //   }
  // );

  // const resultNftData = await getNFT.json().then((result) => {
  //   console.log("resultData" , result.result)
  // })

  // if (resultNftData.total != 0) {
  //   // Display the NFT.
  //   console.log("nft log", resultNftData);
  // } else {
  //   return false;
  // }

  const handleNetworkChange = (selectedOption) => {
    setSelectedNetwork(selectedOption);
    setNetwork(selectedOption[0].name)
    setNetworkId(selectedOption[0].chainID)
  };

  return (
    <>
      <div
        className={darkMode ? "app-light light-mode" : "app-light dark-mode"}
      >
        <div class="container-fluid">
          <div class="banner-card">
            <div class="row align-items-center">
              <div class="col-md-6">
                <div class="data-input">
                  <div class="banner-content">
                    <h3>
                      Hey, would you like to learn how to create a{" "}
                      <span>Generative</span> UI just like this?
                    </h3>
                    <p>
                      In this tutorial we will be creating a generative “orb”
                      animation using pixi.js, picking some lovely random colors
                      and pulling it all together in a nice frosty UI. We're
                      gonna talk accessibility, too.
                    </p>
                  </div>
                  <form>
                    <div class="row ">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="formGroupExampleInput" class="form-label">
                            Network ID
                          </label>
                          <input
                            type="number"
                            name="network_id"
                            onChange={(event) =>
                              setNetworkId(event.target.value)
                            }
                            value={networkId}
                            placeholder="Network Id"
                          />
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="formGroupExampleInput" class="form-label">
                            Network Name
                          </label>
                          <input
                            type="text"
                            name="network"
                            onChange={(event) => setNetwork(event.target.value)}
                            value={network}
                            placeholder="Network chain"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <label class="form-label">Select Network</label>
                        <Select
                          value={selectedNetwork}
                          onChange={handleNetworkChange}
                          options={supportedNetwork}
                          className={"network-select"}
                          placeholder={"Select network"}
                          labelField={"name"}
                          valueField={"chainID"}
                          keepSelectedInList={false}
                        />
                      </div>
                      <div className="col-md-6">
                        <div class="mb-3">
                          <label for="formGroupExampleInput" class="form-label">
                            Contract Address
                          </label>
                          <input
                            type="text"
                            name="contract_address"
                            onChange={(event) =>
                              setContractAddress(event.target.value)
                            }
                            value={contractAddress}
                            placeholder="contract address"
                          />
                        </div>
                      </div>
                    </div>

                    <div class="fetch-btn text-center">
                      <button
                        type="button"
                        class="btn btn-primary mt-4"
                        disabled={nftFetchDataStatus && fetchStatus}
                        onClick={() => handleFetchDataStatus()}
                      >
                        Fetch
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div class="col-md-6">
                <div class="banner-img">
                  <img
                    src={window.location.origin + "/assets/banner.png"}
                    alt="img"
                  />
                </div>
              </div>
            </div>
            {nftFetchDataStatus && (
              <>
                <section
                  className="properties-tab"
                  ref={propertiesRef}
                  id="properties-card"
                >
                  <div className="">
                    <h2 className="image-title">NFT Properties Selector</h2>
                    {fetchStatus && (
                      <div className="text-center">
                        <p>
                          Getting NFT's...loading will take time , it depends
                          upon collection size
                        </p>
                      </div>
                    )}

                    {nftFetchDataStatus &&
                      nftTraits.length == 0 &&
                      !fetchStatus && (
                        <div className="no-data text-center">
                          <h5>No Data found</h5>
                        </div>
                      )}

                    {nftTraits.length > 0 && (
                      <>
                        <div className="nft-properties-wrapper row m-0">
                          <div className="nft-properties col-lg-3 col-xl-2">
                            {nftTraits.map((properties, index) => (
                              <>
                                <div
                                  className={`nft-properties-selector ${
                                    activeProperty.index == index
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleActiveProperty(properties)
                                  }
                                >
                                  {properties.name}
                                </div>
                              </>
                            ))}
                          </div>
                          <div className="selected-property-value col-lg-6 col-xl">
                            {Object.keys(activeProperty).length > 0 && (
                              <>
                                <div className="properties-wrapper">
                                  {activeProperty.values.map(
                                    (values, index) => (
                                      <>
                                        <div
                                          className={`properties ${
                                            selectedValue.filter(
                                              (selected) =>
                                                selected.trait ==
                                                activeProperty.name
                                            ).length > 0 &&
                                            selectedValue
                                              .filter(
                                                (selected) =>
                                                  selected.trait ==
                                                  activeProperty.name
                                              )[0]
                                              .value.includes(values.name)
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() =>
                                            handleSelectedValue(
                                              values.name,
                                              activeProperty.name
                                            )
                                          }
                                        >
                                          <InputGroup.Checkbox
                                            className="custom-checkbox"
                                            checked={
                                              selectedValue.filter(
                                                (selected) =>
                                                  selected.trait ==
                                                  activeProperty.name
                                              ).length > 0
                                                ? selectedValue
                                                    .filter(
                                                      (selected) =>
                                                        selected.trait ==
                                                        activeProperty.name
                                                    )[0]
                                                    .value.includes(values.name)
                                                : false
                                            }
                                            onChange={() =>
                                              handleSelectedValue(
                                                values.name,
                                                activeProperty.name
                                              )
                                            }
                                          />
                                          <h5>{values.name}</h5>
                                          <span className="badge">
                                            {values.count}
                                          </span>
                                        </div>
                                      </>
                                    )
                                  )}
                                </div>
                              </>
                            )}
                            {/* {selectedValue.length > 0 && (
                              <input
                                type="text"
                                placeholder="wallet address"
                                onChange={(e) =>
                                  setWalletAddress(e.target.value)
                                }
                              />
                            )} */}

                            {selectedValue.length > 0 && (
                              <>
                                <div className="text-center">
                                  <button
                                    type="button"
                                    class="btn btn-primary mt-4 "
                                    onClick={() => handleGenerateCode()}
                                  >
                                    Generate Code
                                  </button>
                                  {/* {generateCode && (
                                    <>
                                      <Web3Three
                                        selectedValue={selectedValue}
                                        contractAddress={contractAddress}
                                        networkId={networkId}
                                        network={network}
                                      />
                                    </>
                                  )} */}
                                </div>
                              </>
                            )}
                            {generateCode && (
                              <>
                                <div className="text-center">
                                  <h6 className="mt-4">
                                    import the script in your html file like
                                    shown below.
                                  </h6>
                                </div>
                                {
                                  <pre className="col-lg-12 col-xl code-snippet">
                                    {scriptTemplate}
                                  </pre>
                                }
                              </>
                            )}
                          </div>
                          <div className="col-lg-3 col-xl-2 ">
                            <div className="user-selected-traites">
                              {selectedValue.length > 0 && (
                                <>
                                  <h4 className="text-left mb-3 text-bold">
                                    Selected Traits
                                  </h4>
                                  {selectedValue.map((userselected, index) => (
                                    <>
                                      {userselected.value &&
                                        userselected.value.map(
                                          (userSelectedValue) => (
                                            <div className="user-selected-wrapper">
                                              <small>
                                                {userselected.trait}
                                              </small>
                                              <div className="user-selected">
                                                <h6>{userSelectedValue}</h6>
                                                <i
                                                  className="far fa-trash-alt"
                                                  onClick={() =>
                                                    handleSelectedValue(
                                                      userSelectedValue,
                                                      userselected.trait
                                                    )
                                                  }
                                                ></i>
                                              </div>
                                            </div>
                                          )
                                        )}
                                    </>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {/* <pre>{`
  let getNFT = await fetch(
    https://deep-index.moralis.io/api/v2/your_wallet_address/nft/${contractAddress}?chain=${network}&format=decimal,
    {
     headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key":
       "3LgKxFRe3Tayvrus7e30okVI6vuS5xXyDOLh82OQuVKB84m0kOE2M0eEdXrQL5Bs",
     },
     method: "GET",
    }
   );
   if (getNFT.total != 0) {
    // Display the NFT.
    console.log(getNFT)
   } else {
    return false;
   }}
`}</pre> */}
                </section>
              </>
            )}
          </div>
        </div>
        {/* <section className="sm-padding nft-key-img-sec">
     <Container>
      <h2 className="image-title">Example NFT’s</h2>
      <div className="row">
       {loading
        ? "Loading..."
        : nftData.length > 0
        ? nftData.map((value, index) => {
           let metaData = value.metadata.replace('\\"', '"');
           let ress = JSON.parse(metaData);
           console.log("metadata" + index + "Data" + ress.attributes);
           console.log("metadata image", value.metadata.image);
           return (
            <div className="col-md-4 col-sm-12 mt-3">
             <div className="nft-loot-box">
              <Link to={`/assets/${contractAddress}/${index + 1}`}>
              <div className="nft-loot-card">
               <div className="nft-loot-img-sec">
                <div className="nft-loot-img-sec">
                 <img src={ress.image} />
                </div>
               </div>
               <p>{ress.name}</p>
               {ress.attributes.map((resul) => (
                <>
                 {resul.trait_type}: {resul.value}
                 <br />
                </>
               ))}
               <p></p>
              </div>
              </Link>
             </div>
            </div>
           );
          })
        : ""}
      </div>
     </Container>
    </section> */}
      </div>
    </>
  );
};

export default App;
