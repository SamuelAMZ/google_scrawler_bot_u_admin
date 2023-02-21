// this file handle when a subscription failed from the user, card expired, not enought fund ...
const Membership = require("../../models/Membership");
const History = require("../../models/History");

const handleFailedSubscriptions = async (data) => {
  const uid = data.metadata.uid;
  const recuringType = data.metadata.recuringType;

  // search for user in membership col
  const checkUser = await Membership.findOne({ uid: uid });
  if (!checkUser) {
    return false;
  }

  //  if found update its membership data
  (checkUser.plan = "free"),
    (checkUser.recuringType = "N/A"),
    (checkUser.start = String(Date.now())),
    (checkUser.end = "1"),
    (checkUser.features = ["free content review"]),
    await checkUser.save();

  // add new history record
  const history = new History({
    uid: checkUser.uid,
    status: "failed",
    recuringType: recuringType,
    start: String(Date.now()),
    end: "1",
  });
  await history.save();
};

module.exports = handleFailedSubscriptions;
