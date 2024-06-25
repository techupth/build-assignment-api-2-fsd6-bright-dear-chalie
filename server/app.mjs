import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  ["title", "content", "category"].forEach((field) => {
    if (!newAssignment[field]) {
      return res.status(400).json({
        message:
          "Server could not create assignment because there are missing data from client",
      });
    }
  });

  try {
    await connectionPool.query(
      `
          insert into assignments (title,content, category, length, user_id, status, created_at, updated_at, published_at) 
          values ($1,$2,$3,$4,$5,$6,$7,$8,$9) 
      `,
      [
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.user_id,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection",
    });
  }
  return res.status(201).json({ message: "Created assignment sucessfully" });
});

app.get("/assignments", async (req, res) => {
  let data;
  try {
    data = await connectionPool.query("select * from assignments");
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  return res.status(200).json({
    data: data.rows,
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  let data;
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    data = await connectionPool.query(
      `
        select * from assignments where assignment_id=$1
      `,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection",
    });
  }
  if (!data.rows[0]) {
    return res.status(404).json({
      message: "Server could not find a requested assignment",
    });
  }
  return res.status(200).json({
    data: data.rows[0],
  });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let oldAssignment, newAssignment;
  try {
    oldAssignment = await connectionPool.query(
      `select * from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );
    if (!oldAssignment.rowCount) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to update",
      });
    }
    newAssignment = {
      ...oldAssignment.rows[0],
      ...req.body,
      updated_at: new Date(),
    };
    await connectionPool.query(
      `
          update assignments 
          set title = $2, content=$3, category=$4, length = $5, user_id = $6, status = $7, created_at = $8, updated_at = $9, published_at = $10
          where assignment_id = $1
      `,
      [
        assignmentIdFromClient,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.user_id,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
  } catch {
    res.status(500).json({
      message: "Server could not update assignment because database connection",
    });
  }
  return res.status(200).json({ message: "Updated assignment sucessfully" });
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  try {
    const assignmentIdFromServer = await connectionPool.query(
      `select * from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );
    if (!assignmentIdFromServer.rowCount) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
    await connectionPool.query(
      `delete from assignments where assignment_id = $1`,
      [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection",
    });
  }
  return res.status(200).json({ message: "Deleted assignment sucessfully" });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
