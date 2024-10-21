import Database from "better-sqlite3";
const db = new Database("ges.db");

type WeekString =
  | "week1"
  | "week2"
  | "week3"
  | "week4"
  | "week5"
  | "week6"
  | "week7"
  | "week8"
  | "week9"
  | "week10"
  | "week11"
  | "week12";

export const selectAllUsers = () => {
  const query = "SELECT * FROM users";
  return db.prepare(query).all();
};

export const checkUserExists = (userId: string) => {
  const query = "SELECT * FROM users WHERE userid = ?";
  const user = db.prepare(query).get(userId); /** undefined if not found */
  return user
    ? { operation: true, result: user }
    : { operation: false, errorMessage: "User does not exist" };
};

export const selectUser = (userId: string) => {
  const query = "SELECT * FROM users WHERE userid = ?";
  return db.prepare(query).get(userId);
};

export const selectUserProgress = (userId: string) => {
  const query = "SELECT * FROM progress WHERE userid = ?";
  return db.prepare(query).get(userId);
};

// check if user has logged in this week
export const checkWeeklyLogin = (userId: string, week: string) => {
  const query = "SELECT * FROM progress WHERE userid = ? AND week = ?";
  return db.prepare(query).get(userId, week);
};

export const selectUserScores = (userId: string) => {
  const query = "SELECT * FROM scores WHERE userid = ?";
  return db.prepare(query).get(userId);
};

export const selectUserAttempts = (userId: string) => {
  const query = "SELECT * FROM attempts WHERE userid = ?";
  return db.prepare(query).get(userId);
};

export const updateUserProgress = (userId: string, week: WeekString, date: string) => {
  const query = `UPDATE progress SET ${week} = ? WHERE userid = ?`;
  return db.prepare(query).run(date, userId);
};

export const updateAttemptCount = (userId: string, week: WeekString, newCount: string) => {
  const query = `UPDATE progress SET ${week} = ? WHERE userid = ?`;
  return db.prepare(query).run(newCount, userId);
};
