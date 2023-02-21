// handle when user subscibe for the first time
const Membership = require("../../models/Membership");
const History = require("../../models/History");

const handleFirstSubscription = async (data) => {
  const uid = data.metadata.uid;
  const plan = data.metadata.plan;
  const recuringType = data.metadata.recuringType;
  const start = data.created;
  const features = data.metadata.features;

  // search for user in membership col
  const checkUser = await Membership.findOne({ uid: uid });
  if (!checkUser) {
    return false;
  }

  //  if found update its membership data
  let nextDate;
  if (recuringType === "monthly") {
    nextDate = 30;
  }
  if (recuringType === "quaterly") {
    nextDate = 92;
  }
  let end = new Date(); // Now
  end.setDate(end.getDate() + nextDate);
  let lui = Date.parse(String(end)) / 1000;

  console.log(lui);

  // remove old membership
  await checkUser.remove();

  // create a new one for user
  const membership = new Membership({
    uid,
    plan,
    recuringType,
    start,
    end: String(lui),
    features: features.split(","),
  });
  await membership.save();

  // history

  let startH = new Date(Number(start) * 1000);
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let year = startH.getFullYear();
  let month = months[startH.getMonth()];
  let date = startH.getDate();
  let timeS = date + " " + month + " " + year;

  let endH = new Date(Number(String(lui)) * 1000);
  let yeare = endH.getFullYear();
  let monthe = months[endH.getMonth()];
  let datee = endH.getDate();
  let timeE = datee + " " + monthe + " " + yeare;

  // add new history record
  const history = new History({
    uid: checkUser.uid,
    plan: plan,
    status: "completed",
    recuringType: recuringType,
    start: timeS,
    end: timeE,
  });
  await history.save();
};

module.exports = handleFirstSubscription;
