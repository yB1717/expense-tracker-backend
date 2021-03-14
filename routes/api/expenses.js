const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../../Model/users").User;

router.post("/add", (req, res) => {
  const { name, amount, date, category } = req.body;
  let { userId } = req.body;
  userId = mongoose.Types.ObjectId(userId);

  User.findById(userId, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      if (!doc) {
        res.send("No such user available");
      } else {
        const newExpense = {
          name: name,
          amount: amount,
          date: date,
          category: category,
        };
        const updatedExpenses = [newExpense, ...doc.expenses];
        doc.expenses = updatedExpenses;
        doc.save().then(({ expenses }) => {
          res.send({ allExpenses: expenses });
        });
      }
    }
  });
});

router.get("/getAll", (req, res) => {
  let { userid } = req["headers"];
  userid = mongoose.Types.ObjectId(userid);

  User.findById(userid, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      if (!doc) {
        res.send("No such user exists");
      } else {
        res.send({ allExpenses: doc.expenses });
      }
    }
  });
});

router.put("/edit", (req, res) => {
  let { userId, expenseToBeUpdated } = req.body;
  userId = mongoose.Types.ObjectId(userId);
  User.findById(userId, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      if (!doc) {
        res.send("No such user exists");
      } else {
        const updatedExpenses = doc.expenses.map((expense) => {
          if (expense._id.toString() === expenseToBeUpdated._id)
            return {
              ...expenseToBeUpdated,
              _id: mongoose.Types.ObjectId(expenseToBeUpdated._id),
            };
          return expense;
        });

        doc.expenses = updatedExpenses;
        doc
          .save()
          .then(({ expenses }) => {
            console.log(expenses);
            res.send({ allExpenses: expenses });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  });
});

router.put("/delete", (req, res) => {
  let { userId, expenseId } = req.body;
  userId = mongoose.Types.ObjectId(userId);

  User.findById(userId, (err, doc) => {
    if (err) console.log(err);
    else {
      if (!doc) {
        res.send("No such user exists");
      } else {
        const updatedExpenses = doc.expenses.filter(
          (expense) => expense._id.toString() !== expenseId
        );
        doc.expenses = updatedExpenses;
        doc
          .save()
          .then((savedDoc) => {
            const { expenses } = savedDoc;
            res.send({ allExpenses: expenses });
          })
          .catch((err) => console.log(err));
      }
    }
  });
});

const getMonthAndYear = (date) => {
  date = date.split("-");
  return [
    Number.parseInt(date[1]),
    Number.parseInt(date[0]),
    Number.parseInt(date[2]),
  ];
};

const expensesOnBasisOfWeek = (expenses) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const perWeekCost = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  expenses.forEach((expense) => {
    const [m, y, d] = getMonthAndYear(expense.date);
    if (m === month && year === y) {
      const ceil = Math.ceil(d / 7);
      if (ceil >= 4) {
        perWeekCost["4"] += expense.amount;
      } else {
        perWeekCost[`${ceil}`] += expense.amount;
      }
    }
  });

  return Object.keys(perWeekCost).map((key) => perWeekCost[key]);
};

const expenseOnBasisOfCategory = (expenses) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  const perCategoryCost = {
    Food: 0,
    Fuel: 0,
    Home: 0,
    Shopping: 0,
    Other: 0,
  };
  expenses.forEach((expense) => {
    const [m, y, d] = getMonthAndYear(expense.date);
    if (m === month && year === y) {
      const { category } = expense;
      switch (category) {
        case "Food":
          perCategoryCost["Food"] += expense.amount;
          break;
        case "Fuel":
          perCategoryCost["Fuel"] += expense.amount;
          break;
        case "Home":
          perCategoryCost["Home"] += expense.amount;
          break;
        case "Shopping":
          perCategoryCost["Shopping"] += expense.amount;
          break;
        case "Other":
          perCategoryCost["Other"] += expense.amount;
          break;
      }
    }
  });

  return Object.keys(perCategoryCost).map((key) => perCategoryCost[key]);
};

router.get("/report", (req, res) => {
  let { userid } = req["headers"];
  userid = mongoose.Types.ObjectId(userid);
  User.findById(userid, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      if (!doc) {
        res.send("No user found");
      } else {
        const perWeekCost = expensesOnBasisOfWeek(doc.expenses);
        const perCategoryCost = expenseOnBasisOfCategory(doc.expenses);
        console.log(perWeekCost);
        console.log(perCategoryCost);
        res.send({
          perWeekCost: perWeekCost,
          perCategoryCost: perCategoryCost,
        });
      }
    }
  });
});

const calculateTotalAmountSpent = (expenses) => {
  const totalMoney = expenses.reduce((accumulator, current) => {
    return accumulator + current.amount;
  }, 0);
  return totalMoney;
};

const giveLast5Transactions = (expenses) => {
  const last5Transactions = expenses.filter((_, idx) => idx <= 4);
  return last5Transactions;
};

router.get("/dashboard", (req, res) => {
  let { userid } = req["headers"];
  userid = mongoose.Types.ObjectId(userid);

  User.findById(userid, (err, doc) => {
    if (err) console.log(err);
    else {
      if (!doc) {
        res.send("User id not found");
      } else {
        const totalMoneySpent = calculateTotalAmountSpent(doc.expenses);
        const last5Transactions = giveLast5Transactions(doc.expenses);
        console.log(totalMoneySpent, last5Transactions);
        res.send({
          money: totalMoneySpent,
          transactions: last5Transactions,
        });
      }
    }
  });
});

module.exports = router;
