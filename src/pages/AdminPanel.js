import removeIcon from "../assets/trash.svg";
import unblockIcon from "../assets/unlock-alt.svg";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dataSlice } from "../store/dataSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.data);
  const { setData } = dataSlice.actions;

  const [allSelected, setAllSelected] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [currentUser, setCurrentUser] = useState("");

  async function handleBlockUser() {
    if (selectedUsers.length > 0) {
      await axios.put(`http://localhost:8800/${selectedUsers}`, {
        blocked: true,
      });
      const id = data.filter((user) => user.username === currentUser)[0].id;
      if (selectedUsers.includes(id)) {
        navigate("/");
        window.sessionStorage.removeItem("currentUser");
      }
      setSelectedUsers([]);
    }
  }

  async function handleUnblockUser() {
    if (selectedUsers.length > 0) {
      await axios.put(`http://localhost:8800/${selectedUsers}`, {
        blocked: false,
      });
      setSelectedUsers([]);
    }
  }

  async function handleDeleteUser() {
    if (selectedUsers.length > 0) {
      await axios.delete(`http://localhost:8800/${selectedUsers}`);
      const id = data.filter((user) => user.username === currentUser)[0].id;
      if (selectedUsers.includes(id)) {
        navigate("/");
        window.sessionStorage.removeItem("currentUser");
      }
      setSelectedUsers([]);
    }
  }

  function handleLogout() {
    setSelectedUsers([]);
    navigate("/");
    window.sessionStorage.removeItem("currentUser");
  }

  function handleSelectAll(event) {
    setAllSelected(!allSelected);
    if (event.target.checked) {
      setSelectedUsers(data.map((user) => user.id));
    } else {
      setSelectedUsers([]);
    }
  }

  function handleSelectUser(id) {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((userID) => userID !== id));
    } else {
      setSelectedUsers((prevState) => [...prevState, id]);
    }
  }

  useEffect(() => {
    if (selectedUsers.length > 0 && selectedUsers.length === data.length) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }

    async function updateData() {
      const res = await axios.get("http://localhost:8800/");
      dispatch(setData(res.data));
    }
    updateData();
  }, [selectedUsers]);

  useEffect(() => {
    const user = window.sessionStorage.getItem("currentUser");
    setCurrentUser(user);
  }, []);

  return (
    <div>
      <header className="flex items-center gap-20 bg-[#f0f8ff] py-8 px-8">
        <button
          className="btn rounded-lg bg-red-600 text-white"
          onClick={handleBlockUser}
        >
          Block
        </button>
        <button onClick={handleUnblockUser}>
          <img src={unblockIcon} alt="unblock" />
        </button>
        <button onClick={handleDeleteUser}>
          <img src={removeIcon} alt="trash" />
        </button>
        <p className="ml-auto font-medium">
          Current user:
          <span className="font-bold"> {currentUser}</span>
        </p>
        <button
          className="btn rounded-lg bg-blue-600 text-white"
          onClick={handleLogout}
        >
          Log out
        </button>
      </header>
      <main className="mt-12 px-8">
        <table className="my-0 mx-auto w-full">
          <thead className="text-left">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Last Login</th>
              <th>Registered</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user, index) => {
              return (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.lastLogin}</td>
                  <td>{user.registeredAt}</td>
                  <td>{user.blocked ? "blocked" : "active"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default AdminPanel;
