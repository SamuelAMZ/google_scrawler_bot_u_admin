// will search and return keyword results,a dn total item found

// model
const Usernames = require("../models/Usernames");

const usernamePagination = async (uid, searchKeyword, page, perPage) => {
  try {
    const list = await Usernames.find({
      uid: uid,
      username: { $regex: searchKeyword, $options: "i" },
    })
      .sort([["createdAt", -1]])
      .skip(Number(page) * Number(perPage))
      .limit(Number(perPage));

    const totalItems = await Usernames.find({
      uid: uid,
      username: { $regex: searchKeyword, $options: "i" },
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

module.exports = usernamePagination;
