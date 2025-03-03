import { Router, Request, Response } from "express";
import {
  BaselineLiteracyQuestions,
  BaselineNumeracyQuestions,
  QuestionSchema,
  User,
} from "../models";
import { CourseEnrolled, extractor, fetchQuestions, getActiveDates, validateWeek } from "../utils";

export const router = Router();

router.get("/week-dates", async (req: Request, res: Response) => {
  const { courseEnrolled } = req.query;
  const activeDates = await getActiveDates(courseEnrolled as CourseEnrolled);
  res.status(200).json(activeDates);
});

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/find", async (req: Request, res: Response) => {
  const { userid } = req.query;
  try {
    const users = await User.find({ userid }, { _id: 0 }).lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/weekly-questions", async (req: Request, res: Response) => {
  const { week, topic, courseEnrolled } = req.query as {
    week: string;
    topic: string;
    courseEnrolled: CourseEnrolled;
  };

  try {
    let GAME_QUESTIONS = (await fetchQuestions(courseEnrolled, topic)) as QuestionSchema;

    if (GAME_QUESTIONS.error) {
      res.status(400).json({ message: GAME_QUESTIONS.error });
      return;
    }

    if (!GAME_QUESTIONS || !validateWeek(GAME_QUESTIONS, week)) {
      res.status(404).json({ message: `${week} does not exist in this question set.` });
      return;
    }

    res.send(GAME_QUESTIONS[week].allQuestions);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error fetching ${topic} questions` });
  }
});

router.get("/module-map", async (req: Request, res: Response) => {
  const { week, topic, courseEnrolled } = req.query as {
    week: string;
    topic: string;
    courseEnrolled: CourseEnrolled;
  };

  try {
    let GAME_QUESTIONS = (await fetchQuestions(courseEnrolled, topic)) as QuestionSchema;

    if (GAME_QUESTIONS.error) {
      res.status(400).json({ message: GAME_QUESTIONS.error });
      return;
    }

    if (!GAME_QUESTIONS || !Object.hasOwn(GAME_QUESTIONS, week)) {
      res.status(404).json({ message: `Invalid week: ${week}` });
    } else {
      res.send({ [week]: Object.keys(GAME_QUESTIONS[week].allQuestions)[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Error fetching ${topic} map` });
  }
});

router.get("/baseline-questions", async (req: Request, res: Response) => {
  const { topic } = req.query as { topic: string };
  try {
    const GAME_QUESTIONS =
      topic.toUpperCase() === "NUMERACY"
        ? await BaselineNumeracyQuestions.findOne().lean()
        : await BaselineLiteracyQuestions.findOne().lean();
    delete (GAME_QUESTIONS as any)["_id"];
    const baselineQuestions = GAME_QUESTIONS;
    res.send(baselineQuestions);
  } catch (error) {
    console.error(error);
  }
});

router.get("/week-module-map", async (req: Request, res: Response) => {
  const { topic, courseEnrolled } = req.query as {
    week: string;
    topic: string;
    courseEnrolled: CourseEnrolled;
  };

  try {
    let GAME_QUESTIONS = (await fetchQuestions(courseEnrolled, topic)) as QuestionSchema;

    if (GAME_QUESTIONS.error) {
      res.status(400).json({ message: GAME_QUESTIONS.error });
      return;
    }

    if (!GAME_QUESTIONS) {
      res.status(404).json({ message: `Question not found!` });
    } else {
      res.send(extractor(GAME_QUESTIONS));
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: `Internal error occured when fetching ${topic} map` });
  }
});

export default router;
