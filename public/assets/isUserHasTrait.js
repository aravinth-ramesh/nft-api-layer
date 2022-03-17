let userWalletNftData = {
  fetchStatus: true,
  itemsDataTotal: 1,
  loading: true,
};

export const fetchUserWalletNfts = async (
  walletAddress,
  contractAddress,
  network,
  selectedValue
) => {

  try{

  let getNFT = await fetch(
    `
    https://deep-index.moralis.io/api/v2/${walletAddress}/nft/${contractAddress}?chain=${network}&format=decimal`,
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

  let usernftDatas = [];

  const response = await getNFT.json().then(async (result) => {
    usernftDatas = [...usernftDatas, ...result.result];

    const fetchcount = Math.ceil(Number(result.total) / 500) - 1;

    const itemsCount = Math.ceil(Number(usernftDatas.length) / 500) - 1;

    if (fetchcount > itemsCount) {
      userWalletNftData = {
        ...userWalletNftData,
        itemsDataTotal: userWalletNftData.itemsDataTotal + 1,
      };
      usernftDatas = [...usernftDatas, ...result.result];
    } else {
      console.log(usernftDatas);
      userWalletNftData = {
        ...userWalletNftData,
        fetchStatus: false,
      };
      let res = await getData(usernftDatas).then((data) => data);
      let isHas = constructAttributes(res, selectedValue);

      if (isHas > 0) {
        userWalletNftData = {
          ...userWalletNftData,
          loading: false,
        };
        return true;
      } else {
        return false;
      }
    }
  });
  return response;
  }catch(e){
    if(e.message === "Cannot read properties of undefined (reading 'map')"){
      console.log(`\x1b[31mSelected value field is required.`)
    }

    if(e.message === "result.result is not iterable"){
      console.log(`\x1b[31mInvalid wallet address or contract address.`)
    }

  }

};

async function getData(data) {
  const arrOfPromises = data.map((item) =>
    fetch(item.token_uri).then((res) => res.json())
  );
  return Promise.all(arrOfPromises);
}

const constructAttributes = (data, selectedValue) => {
  let uniqueAttributesArray = [];
  let attributesArray = [];
  let uniqueValueArray = [];
  data.map((result, index) => {
    let attributes = result.attributes.map((obj) => obj);
    attributesArray = [...attributesArray, ...attributes];
    uniqueAttributesArray = [
      ...new Set(
        attributes.map((item, index) => {
          return { name: item.trait_type, index: index };
        })
      ),
    ];
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
  const isTrait = isUserHasTraits(uniqueAttributesArray, selectedValue);
  return isTrait;
};

const containsAny = (source, target) => {
  let result = source.filter(function (item) {
    return target.indexOf(item.name) > -1;
  });
  return result.length > 0;
};

const isUserHasTraits = (uniqueAttributesArray, selectedValue) => {
  let userHasTraitCount = 0;

  selectedValue.map((userValue) => {
    uniqueAttributesArray.map((attributes) => {
      if (attributes.name === userValue.trait) {
        const isUserHas = containsAny(attributes.values, userValue.value);
        if (isUserHas) {
          userHasTraitCount = userHasTraitCount + 1;
        }
      }
    });
  });

  return userHasTraitCount;
};
