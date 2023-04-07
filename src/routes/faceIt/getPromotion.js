module.exports = async function process() {
  const startDate = new Date(new Date(2020, 10, 11).setUTCHours(0, 0, 0));
  const endDate = new Date(new Date(2020, 11, 31).setUTCHours(23, 59, 59));
  return {
    status: 'success',
    result: {
      startDate,
      endDate,
    },
  };
};
