import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import "./App.css";
import History from "./History.js";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

function App() {
  const navigate = useNavigate();
  const currentDate = new Date().toISOString().split("T")[0];

  const [tasks, setTasks] = useState([]);
  const [percentage, setPercentage] = useState(0);
  const [graphData, setGraphData] = useState({});
  const [temperature, setTemperature] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(currentDate);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    date: "",
    level: "C",
    delFlg: "N",
    compFlg: "N",
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/");
        const data = await response.json();

        setTasks(data);

        const currentDateTasks = data.filter(
          (task) => task.date === currentDate && task.delFlg !== "Y"
        );
        const completedTasks = currentDateTasks.filter((task) => task.compFlg === "Y");
        const completionPercentage =
          currentDateTasks.length > 0
            ? Math.ceil((completedTasks.length / currentDateTasks.length) * 100 / 10) * 10
            : 0;

        setPercentage(completionPercentage);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [currentDate]);

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=11.1271&longitude=78.6569&current_weather=true"
        );
        const data = await response.json();
        setTemperature(`${data.current_weather.temperature}°C`);
      } catch (error) {
        console.error("Error fetching temperature:", error);
        setTemperature("N/A");
      }
    };

    fetchTemperature();
    const tempInterval = setInterval(fetchTemperature, 10 * 60 * 1000);
    return () => clearInterval(tempInterval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setTime(currentTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getFilteredTasks = (data) => {
      const current = new Date();
      const startDate = new Date(current);
      startDate.setDate(current.getDate() - 2);
      const endDate = new Date(current);
      endDate.setDate(current.getDate() + 2);

      const start = startDate.toISOString().split("T")[0];
      const end = endDate.toISOString().split("T")[0];

      return data.filter((task) => task.date >= start && task.date <= end);
    };

    const countCompletedTasks = (tasks) => {
      const taskCount = {};
      tasks.forEach((task) => {
        if (task.compFlg === "Y") {
          taskCount[task.date] = (taskCount[task.date] || 0) + 1;
        }
      });
      return taskCount;
    };

    const filteredTasks = getFilteredTasks(tasks);
    const completedTasks = countCompletedTasks(filteredTasks);

    const labels = [];
    const completed = [];
    const current = new Date();

    for (let i = -2; i <= 2; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const formattedDate = new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      labels.push(formattedDate);
      completed.push(completedTasks[dateString] || 0);
    }

    setGraphData({
      labels,
      datasets: [
        {
          label: "Completed Tasks",
          data: completed,
          backgroundColor: "#875bae",
          borderColor: "#875bae",
          borderWidth: 1,
        },
      ],
    });
  }, [tasks]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
        alert("Task added successfully!");
      } else {
        throw new Error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compFlg: "Y" }),
      });

      if (response.ok) {
        alert("Task marked as completed!");
        setTasks(
          tasks.map((task) => (task.ids === taskId ? { ...task, compFlg: "Y" } : task))
        );
      } else {
        throw new Error("Failed to complete task");
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delFlg: "Y" }),
      });

      if (response.ok) {
        alert("Task deleted successfully!");
        setTasks(tasks.filter((task) => task.ids !== taskId));
      } else {
        throw new Error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
return (
    <div className="master-container">
      <div className="top-container">
        <div className="top-bar">
          <button className="top-div">
            Planify <i className="fa fa-pagelines"></i>
          </button>
          <button className="top-div">
            Hi Sara <i className="fa fa-smile-o"></i>
          </button>
          <button className="top-div">
            Under Dev <i className="fa fa-cogs"></i>
          </button>
          <button
            className="top-div history"
            onClick={() => navigate("/history")}
          >
            Consolidated <i className="fa fa-history"></i>
          </button>
        </div>
      </div>

      <div className="mid-container">
        <div className="circles">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="211"
            height="211"
            viewBox="0 0 211 211"
          >
            <defs>
              <clipPath id="clip-path">
                <circle
                  id="mask"
                  cx="105.5"
                  cy="105.5"
                  r="105.5"
                  transform="translate(312 -1822)"
                  fill="#fff"
                  stroke="#707070"
                  strokeWidth="1"
                />
              </clipPath>
            </defs>
            <g id="circle" transform="translate(-312 1822)">
              <g
                id="bg"
                transform="translate(312 -1822)"
                fill="#fff"
                stroke="#707070"
                strokeWidth="1"
              >
                <circle cx="105.5" cy="105.5" r="105.5" stroke="none" />
                <circle cx="105.5" cy="105.5" r="105" fill="none" />
              </g>
              <g id="water" clipPath="url(#clip-path)">
                <path
                id="waveShape" className={`p${percentage}`}
                  d="M500,118.244v223.11H4V106.464c43.35,1.17,46.02,11.89,94.4,11.89,51.2,0,51.2-12,102.39-12s51.2,12,102.4,12,51.2-12,102.41-12C453.98,106.354,456.65,117.074,500,118.244Z"
                  transform="translate(308 -1830.354)"
                  fill="#875BAE"
                />
              </g>
            </g>
            <text
              x="105.5"
              y="105.5"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="24"
              fill="#000"
            >
              {percentage}% Goal Completed
            </text>
          </svg>
        </div>
        <div className="large-div graph graph-outline">
          <div className="graph-outer">
            <h6>Task Completion Status</h6>

            <div className="large-div graph">
              {graphData.labels && graphData.datasets ? (
                <Bar
                  data={graphData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                    },
                  }}
                />
              ) : (
                <p>Loading data...</p>
              )}
            </div>
          </div>
        </div>
        <div className="stacked-container">
          <div className="timer">
            <p>{date}</p>
            <p>{time}</p>
            <p>{temperature}</p>
          </div>

          <div className="widget">
          <p>Custom widget</p>
            <button className="edit-btn">
              <i className="fa fa-pencil"></i>
            </button>
          </div>
        </div>
        <div className="large-div critical-box">
          <div className="grid-item critical-title">
            <p>Critical task</p>
          </div>
          {tasks
            .filter((task) => task.level === "C" && task.delFlg === "N")
            .slice(0, 50)
            .map((task, index) => (
              <div className="grid-item" key={index}>
                <span>{task.title}  -  {task.date}                 <div className="icon-container">
                    <i className={`fa fa-star ${task.compFlg}`}></i>
                    <span className="tooltip">Completed &#128578;</span>
                  </div></span>{" "}

                <button className="trash-btn" onClick={() => handleDelete(task.ids)}>
                  <i className="fa fa-trash"></i>
                </button>
                <button className="tick-btn" onClick={() => handleComplete(task.ids)}>
                  <i className="fa fa-check"></i>
                </button>
              </div>
            ))}
        </div>
      </div>

      <div className="last-container">
        <div className="add-plan">
          <form className="add-plan" onSubmit={handleSubmit}>
            <input
              className="tite"
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <input
              className="dsc"
              type="text"
              name="desc"
              placeholder="Describe"
              value={formData.desc}
              onChange={handleChange}
              required
            />
            <select
              className="leel"
              name="level"
              value={formData.level}
              onChange={handleChange}
            >
              <option value="C">Critical</option>
              <option value="M">Medium</option>
              <option value="L">Low</option>
            </select>
            <input
              className="dae date-picer"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <input
              className="delFlg"
              type="text"
              name="delFlg"
              value={formData.delFlg}
              readOnly
              style={{ display: "none" }}
            />
            <input
              className="compFlg"
              type="text"
              name="compFlg"
              value={formData.compFlg}
              readOnly
              style={{ display: "none" }}
            />
            <button className="submit" type="submit">
              Planify
            </button>
          </form>
        </div>
        <div className="content-grid">
          <script>console.log(currentDate)</script>
          {tasks
            .filter((task) => task.delFlg === "N" && task.date === currentDate)
            .map((task, index) => (
              <div className="grid-item" key={task.ids}>
                <h6>
                  {task.title}
                  <div className="icon-container">
                    <i className={`fa fa-star ${task.compFlg}`}></i>
                    <span className="tooltip">Completed &#128578;</span>
                  </div>
                </h6>
                <br></br>
                <p>{task.desc}</p>
                <p>{task.date}</p>
                <br></br>
                <div className={task.level}></div>
                <button
                  className="trash-btn"
                  onClick={() => handleDelete(task.ids)}
                >
                  <i className="fa fa-trash"></i>
                </button>
                <button
                  className="tick-btn"
                  onClick={() => handleComplete(task.ids)}
                >
                  <i className="fa fa-check"></i>
                </button>
              </div>
            ))}
        </div>
        <div className="news">
          <div className="large-div critical-box news-box">
            <div className="grid-item critical-title">
              <p>Non Critical task</p>
            </div>
            {tasks
              .filter((task) => task.level !== "C" && task.delFlg === "N")
              .slice(0, 50)
              .map((task, index) => (
                <div className="grid-item" key={index}>
                  <span>{task.title}  -  {task.date}                 <div className="icon-container">
                    <i className={`fa fa-star ${task.compFlg}`}></i>
                    <span className="tooltip">Completed &#128578;</span>
                  </div></span>{" "}
                  {/* Display the title from the fetched data */}
                  <button className="trash-btn" onClick={() => handleDelete(task.ids)}>
                  <i className="fa fa-trash"></i>
                </button>
                <button className="tick-btn" onClick={() => handleComplete(task.ids)}>
                  <i className="fa fa-check"></i>
                </button>
                </div>
              ))}
          </div>
        </div>
        <div className="footer">Made with &#10084;
        </div>
      </div>
      </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;
