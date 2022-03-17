import React,{ useEffect , useState } from "react";
import Web3 from "web3";
import $ from 'jquery';
// import {getNfts} from './WebThreeJs'

let authentication = {
  loading: true,
  accounts: "",
  connectWalletStatus: false,
  authStatus: false,
  ethBalance: null,
  logoutStatus: localStorage.getItem("inital_connect"),
  chainStatus: false,
};

// $(document).ready(function () {
//   loadScript(web3Load)
//   renderHtml()
// });


function loadScript(callback){

  console.log("loading script")

  var head = document.head;

  var bootstrapCss = document.createElement('link')
  bootstrapCss.type = "stylesheet"
  bootstrapCss.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"

  head.append(bootstrapCss)

  var bootstrapScript = document.createElement('script')
  bootstrapScript.type = "text/javascript"
  bootstrapScript.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js"

  head.append(bootstrapScript)

  var web3Script = document.createElement('script');
  web3Script.type = 'text/javascript';
  web3Script.src = "https://cdnjs.cloudflare.com/ajax/libs/web3/1.6.1/web3.min.js";

  head.appendChild(web3Script);

  web3Script.onreadystatechange = callback;
  web3Script.onload = callback;
}

const web3Load = (netID) => {
  if (localStorage.getItem("inital_connect") === null) {
    localStorage.setItem("inital_connect", "false");
  }

  $("#connect_wallet").click(function () {
    connectWallet(netID);
  });

  checkConnection();

  try {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      checkAccountChange();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      checkAccountChange();
    }
  } catch (error) {
    console.log(error);
  }
 
  return { authentication };
}

const connectWallet = async (netID) => {
  console.log(netID)
  console.log("connecting wallet");
  authentication = {
    ...authentication,
    connectWalletStatus: true,
  };
  try {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      const network = await window.web3.eth.net.getId();

      if (network !== 97 && network !== 56) {
        changeNetwork();
      } else {
        await window.ethereum.enable();
        console.log("Etherum enabled");
        authentication = {
          ...authentication,
          connectWalletStatus: true,
        };
        console.log("First true");
        //checkAccountChange();
        //metamaskDisconnect();
        getWalletAddress(netID);
        //saveAccountDetails()
      }
      return true;
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      authentication = {
        ...authentication,
        connectWalletStatus: true,
      };
      //checkAccountChange();
      //metamaskDisconnect();
      getWalletAddress();
      console.log("Second true");
      //saveAccountDetails()
      return true;
    } else {
      authentication = {
        ...authentication,
        connectWalletStatus: false,
      };
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      return false;
    }
  } catch (error) {
    let notificationMsg;
    if (error.message) {
      notificationMsg = error.message;
    } else {
      notificationMsg =
        "Something went wrong. Please refresh the page and try again.";
    }
    console.log(notificationMsg);
    authentication = {
      ...authentication,
      connectWalletStatus: false,
    };
  }
};

const checkAccountChange = async (givenProvider) => {
  window.ethereum.on("accountsChanged", async function (accounts) {
    console.log("account changes");
    const web3 = window.web3;
    const network = await web3.eth.net.getId();
    console.log("networ", network);
    if (network !== 97 && network !== 56) {
      //must be on mainnet or Testnet
      console.log("Only this");
      onAcountChange(false, false);
    } else {
      console.log("running change");
      //Do this check to detect if the user disconnected their wallet from the Dapp
      if (accounts && accounts[0]) onAcountChange(accounts[0], true);
      else {
        /*
          @Arg1 : account address (String)
          @Arg2 : isAuthenticated (bool) 
        */
        onAcountChange(false, false);

        /*
          @Arg1 : chain ID (Int)
          @Arg2 : isAuthenticated (bool) 
        */
        onNetworkChange(false, false);
      }
    }
  });
  window.ethereum.on("chainChanged", (chainId) => {
    // Handle the new chain.
    // Correctly handling chain changes can be complicated.
    // We recommend reloading the page unless you have good reason not to.
    authentication = {
      ...authentication,
      chainStatus: true,
    };
  });
};

const onAcountChange = (arg1, arg2) => {
  console.log("Arsf1", arg1);
  console.log("Arsdf2", arg2);
  saveAccountDetails();
};

const getWalletAddress = async (netID) => {
  console.log("netId" , netID)
  let web3 = window.web3;
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      // Network ID
      const networkId = await web3.eth.net.getId();
      console.log("Networkid", networkId);

      if (networkId === netID) {
      } else {
        changeNetwork();
      }
    } catch (error) {
      console.log(
        "Something went wrong. Please refresh the page and try again."
      );
      authentication = {
        ...authentication,
        connectWalletStatus: false,
      };
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    try {
      // Network ID
      const networkId = await web3.eth.net.getId();
      console.log("Networkid", networkId);

      if (networkId === netID) {
      } else {
        changeNetwork();
      }
    } catch (error) {
      console.log(
        "Something went wrong. Please refresh the page and try again."
      );
      authentication = {
        ...authentication,
        connectWalletStatus: false,
      };
    }
  }
};

const changeNetwork = async () => {
  // MetaMask injects the global API into window.ethereum
  if (window.ethereum) {
    try {
      // check if the chain to connect to is installed
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x61" }], // chainId must be in hexadecimal numbers
      });
      await window.ethereum.enable();
      console.log("Etherum enabled");
      if (!authentication.chainStatus) {
        saveAccountDetails();
      }
      //saveAccountDetails();
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                //https://data-seed-prebsc-1-s1.binance.org:8545/
                chainId: "0x61",
                rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
                chainName: "Smart Chain - Testnet",
                nativeCurrency: {
                  name: "Binance",
                  symbol: "BNB", // 2-6 characters long
                  decimals: 18,
                },
                blockExplorerUrls: ["https://testnet.bscscan.com"],
              },
            ],
          });
          await window.ethereum.enable();
          console.log("Etherum enabled");
          saveAccountDetails();
        } catch (addError) {
          console.error(addError);
          authentication = {
            ...authentication,
            connectWalletStatus: false,
          };
          console.log({});
        }
      }
      console.error(error);
    }
  } else {
    // if no window.ethereum then MetaMask is not installed
    alert(
      "MetaMask is not installed. Please consider installing it: https://metamask.io/download.html"
    );
    authentication = {
      ...authentication,
      connectWalletStatus: false,
    };
  }
};

const saveAccountDetails = async () => {
  console.log("logging ");
  try {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const ethBalance = await web3.eth.getBalance(accounts[0]);
    const ethBalanceFormated = await web3.utils
      .fromWei(ethBalance, "Ether")
      .substring(0, 5);
    authentication = {
      ...authentication,
      loading: false,
      authStatus: true,
      accounts: accounts[0],
      chainStatus: false,
      connectWalletStatus: false,
      ethBalance: ethBalanceFormated,
      logoutStatus: localStorage.getItem("inital_connect"),
    };
    console.log(authentication);
  } catch (error) {
    authentication = {
      ...authentication,
      loading: false,
      authStatus: false,
      accounts: "",
      chainStatus: false,
      connectWalletStatus: false,
      ethBalance: 0,
      logoutStatus: localStorage.getItem("inital_connect"),
    };
    console.log(authentication);
    console.log("error", error);
  }
};

const checkConnection = async () => {
  let web3 = window.web3;

  authentication = {
    ...authentication,
    connectWalletStatus: true,
  };
  // Check if browser is running Metamask
  console.log("checking connection");
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
  }

  // Check if User is already connected by retrieving the accounts
  await web3.eth.getAccounts().then(async (response) => {
    // Set User account into state
    const accounts = response;
    console.log(accounts);
    if (response.length > 0) {
      const ethBalance = await web3.eth.getBalance(accounts[0]);
      const ethBalanceFormated = await web3.utils
        .fromWei(ethBalance, "Ether")
        .substring(0, 5);
      authentication = {
        ...authentication,
        loading: false,
        authStatus: true,
        accounts: accounts[0],
        chainStatus: false,
        connectWalletStatus: false,
        ethBalance: ethBalanceFormated,
        logoutStatus: localStorage.getItem("inital_connect"),
      };
      getNfts()
      console.log(authentication);
    } else {
      authentication = {
        ...authentication,
        connectWalletStatus: false,
        authStatus: false,
      };
    }
  });
};

const onNetworkChange = (arg1, arg2) => {
  console.log("Ar1", arg1);
  console.log("Ar2", arg2);
  authentication = {
    ...authentication,
    accounts : arg1,
    authStatus : arg2
  };
  hanldeLogout()
};

const hanldeLogout = () => {
  console.log("logout")
  console.log(authentication)
  if(authentication.chainStatus){
    authentication = {
      ...authentication,
      logoutStatus : "true" , 
      authStatus : false
    };
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userLoginStatus");
    localStorage.removeItem("user_picture");
    localStorage.removeItem("username");
    localStorage.removeItem("wallet_address");
    localStorage.setItem("inital_connect" , false);
  }else{
    authentication = {
      ...authentication,
      logoutStatus : "true" , 
      authStatus : false
    };
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userLoginStatus");
    localStorage.removeItem("user_picture");
    localStorage.removeItem("username");
    localStorage.removeItem("wallet_address");
    localStorage.setItem("inital_connect" , false);
    //window.location = "/";
  }
};

export const getAuthentiocationState = () => {
  return {...authentication}
}

const getNfts = async (contractaddress , chain) => {
  let getNFT = await fetch(
   `https://deep-index.moralis.io/api/v2/${authentication.accounts}/nft/${contractaddress}?chain=${chain}&format=decimal`,
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
  }
 };

 const checkNFTdata = async () => {
  // Now we need to check if the NFT has this particular trail or not.
  if (true) {
   return true;
  } else {
   return false;
  }
 }

const WebThreeJs = (props) => {

  const netID = props.networkId ;

  const [walletNft, setWalletNFT] = useState("");
  const [selectedNFT, setSelectedNFT] = useState("");

  const [authStatus , setAuthStatus] = useState(() => getAuthentiocationState())

  const forceUpdate = React.useCallback(() => setAuthStatus({}), []);

  useEffect(() => {
    loadScript(web3Load(netID))
  }, [])

  useEffect(() => {
    console.log("auth changes")
    console.log(getAuthentiocationState)
    if(authentication.authStatus){
      getNfts(props.contractAddress , props.network)
    }
  },[authStatus])


  return (
    <>
      <button onClick={() => connectWallet(netID)}>connect wallet web 3</button>
    </>
  )

}

export default WebThreeJs