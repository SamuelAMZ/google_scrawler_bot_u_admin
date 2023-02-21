// will search and return keyword results,a dn total item found

// model
const UserReportLeak = require("../models/UserReportLeak");

const reportLeakPagination = async (uid, searchKeyword, page, perPage) => {
  try {
    const list = await UserReportLeak.find({
      uid: uid,
      website: { $regex: searchKeyword, $options: "i" },
    })
      .sort([["createdAt", -1]])
      .skip(Number(page) * Number(perPage))
      .limit(Number(perPage));

    const totalItems = await UserReportLeak.find({
      uid: uid,
      website: { $regex: searchKeyword, $options: "i" },
    });
    const totalItemsLength = totalItems.length;

    return {
      list,
      total: totalItemsLength,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = reportLeakPagination;
