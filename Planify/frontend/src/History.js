// history.js
import React, { useEffect, useState } from "react";

function History() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch tasks from the server
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => {
        // Sort tasks by date in ascending order
        const sortedTasks = data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
        setTasks(sortedTasks);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  // Group tasks by date
  const groupedTasks = tasks.reduce((groups, task) => {
    const date = task.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Consolidated page</h1>
      <div className="content-grid">
        {Object.keys(groupedTasks).map((date) => (
          <div key={date} className="task-group">
            <h2>{date}</h2> {/* Display date */}
            {groupedTasks[date].map((task) => (
              <div className="grid-item" style={{ margin: "10px" }} key={task.ids}>
                <h6>
                  {task.title}
                  <div className="icon-container">
                  <i className={`fa fa-star ${task.compFlg}`}></i>
                    <span className="tooltip">Completed &#128578;</span>
                  </div>
                </h6>
                <br />
                <p>{task.desc}</p>
                <p>{task.date}</p>
                <br />
                <div className={task.level}></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default History;
