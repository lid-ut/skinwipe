module.exports = async function process(req) {
  return {
    status: 'success',
    result: {
      blackListedItems: (req.user.blackListedItems || []).map(bli => {
        return {
          appid: bli.appid,
          name: bli.name,
          assetid: bli.assetid,
        };
      }),
    },
  };
};
