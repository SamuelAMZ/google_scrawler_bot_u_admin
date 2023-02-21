const express = require("express");
const paginationRoute = express.Router();

// validation lib
const Joi = require("@hapi/joi");

// helpers
const domainPagination = require("../../helpers/domainsPagination");
const urlPagination = require("../../helpers/urlPagination");
const reportLeakPagination = require("../../helpers/reportLeakPagination");
const historyPagination = require("../../helpers/historyPagination");
const usernamePagination = require("../../helpers/usernamesPagination");

const schema = Joi.object({
  uid: Joi.string().max(1024).required(),
  page: Joi.string().max(1024).required(),
  perPage: Joi.string().max(1024).required(),
  searchKeyword: Joi.string().max(1024).allow(""),
  target: Joi.string().max(1024).required(),
});

paginationRoute.post("/", async (req, res) => {
  const { uid, page, perPage, searchKeyword, target } = req.body;

  // joi validation sbody data
  try {
    const validation = await schema.validateAsync({
      uid,
      page,
      perPage,
      searchKeyword,
      target,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
    return;
  }

  //   search search id
  try {
    let dataReturned = null;

    if (target === "domains") {
      dataReturned = await domainPagination(uid, searchKeyword, page, perPage);
    }
    if (target === "urls") {
      dataReturned = await urlPagination(uid, searchKeyword, page, perPage);
    }
    if (target === "report") {
      dataReturned = await reportLeakPagination(
        uid,
        searchKeyword,
        page,
        perPage
      );
    }
    if (target === "history") {
      dataReturned = await historyPagination(uid, searchKeyword, page, perPage);
    }
    if (target === "usernames") {
      dataReturned = await usernamePagination(
        uid,
        searchKeyword,
        page,
        perPage
      );
    }

    // all result found
    const list = dataReturned.list;

    // get total result
    const totalItems = dataReturned.total;

    // if no search send 400
    if (!list || !totalItems) {
      return res.status(400).json({
        message: `error listing searches`,
        code: "bad",
        payload: "nothing",
      });
    }

    return res.status(200).json({
      message: `single search fetched successfully`,
      code: "ok",
      payload: { list, totalItemsLength: totalItems },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `server error when searching for single search`,
    });
  }
});

module.exports = paginationRoute;
