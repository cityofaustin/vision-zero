import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { format, parseISO } from "date-fns";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Pagination,
  PaginationItem,
  PaginationLink,
  Popover,
  Row,
  Table,
  Button,
  Spinner,
  PopoverBody,
} from "reactstrap";
import Can from "../../auth/Can";
import { useAuth0 } from "../../auth/authContext";
import { rules } from "../../auth/rbac-rules";

// Call the list_users API and return the users for the current page
async function getCurrentPageUsers(page, perPage, token) {
  const endpoint = `${process.env.REACT_APP_CR3_API_DOMAIN}/user/list_users?page=${page}&per_page=${perPage}`;
  const res = await axios.get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
}

// Fetch an array of all the users
async function getAllUsers(pageCount, perPage, totalUsers, setAllUsers, token) {
  let page = 0;
  let users = [];
  // query every page of users until we have fetched them all
  while (page <= pageCount) {
    const res = await getCurrentPageUsers(page, perPage, token);
    res.data.users.forEach(user => {
      users.push(user);
    });
    page++;
  }
  // once we have fetched all users, update the users array in state
  if (users.length === totalUsers) {
    setAllUsers(users);
    return users;
  } else {
    console.error(
      "Problem with fetching, user emails to copy does not match up with total number of users."
    );
  }
}

// Copy all user emails to the clipboard
const getUserEmails = (userArray, setCopyUserEmailsClicked) => {
  let userEmails = "";
  userArray.forEach(user => {
    userEmails += `${user.email}; `;
  });
  // timeout determines how long the status popover displays
  const popOverTime = 2000;
  setTimeout(() => setCopyUserEmailsClicked(false), popOverTime);
  return navigator.clipboard.writeText(userEmails);
};

const UserRow = ({ user }) => {
  const userLink = `/users/${user.user_id}`;

  const isBlocked = status => status === false || status === undefined;

  const getBadge = status => {
    return isBlocked(status) ? "success" : "danger";
  };

  const getStatus = status => {
    return isBlocked(status) ? "Active" : "Blocked";
  };

  return (
    <tr key={user.user_id.toString()}>
      <th scope="row">
        <Link to={userLink}>{user.name}</Link>
      </th>
      <td>
        <Link to={userLink}>{user.email}</Link>
      </td>
      <td>{format(parseISO(user.created_at), "MM/dd/yyyy")}</td>
      <td>{user.logins_count}</td>
      <td>
        {user.last_login
          ? format(parseISO(user.last_login), "MM/dd/yyyy")
          : "Never"}
      </td>
      <td>{rules[user.app_metadata.roles[0]].label}</td>
      <td>
        <Link to={userLink}>
          <Badge color={getBadge(user.blocked)}>
            {getStatus(user.blocked)}
          </Badge>
        </Link>
      </td>
    </tr>
  );
};

const Users = () => {
  const { getRoles } = useAuth0();
  const token = window.localStorage.getItem("id_token");

  const [userList, setUserList] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const [isFetchingAllUsers, setIsFetchingAllUsers] = useState(false);
  const [copyUserEmailsClicked, setCopyUserEmailsClicked] = useState(false);
  const perPage = 50;

  // Sets the user list for the current page and the total number of users for all pages
  useEffect(() => {
    getCurrentPageUsers(currentPage, perPage, token).then(res => {
      setUserList(res.data.users);
      setTotalUsers(res.data.total);
    });
    // eslint-disable-next-line
  }, [token, currentPage, perPage]);

  const pageCount = Math.ceil(totalUsers / perPage);

  const updatePage = newPageValue => {
    setUserList(null);
    setCurrentPage(newPageValue);
  };

  // Handles the copy user emails button click
  async function handleCopyUserEmails() {
    setCopyUserEmailsClicked(true);
    let userArray = [];
    // Only do this if the user hasn't already fetched data. if they have, skip this step
    // and copy what is in state to the clipboard
    if (allUsers?.length !== totalUsers) {
      setIsFetchingAllUsers(true);
      userArray = await getAllUsers(
        pageCount,
        perPage,
        totalUsers,
        setAllUsers,
        token
      );
      // once we have all users, copy the emails to the clipboard using local variable
      !!userArray && getUserEmails(userArray, setCopyUserEmailsClicked);
      setIsFetchingAllUsers(false);
    } else {
      // use state if we already have fetched the data before
      getUserEmails(allUsers, setCopyUserEmailsClicked);
    }
  }

  return (
    <Can
      roles={getRoles()}
      perform="users:get"
      yes={() => (
        <div className="animated fadeIn">
          <Row>
            <Col>
              <Card>
                <CardHeader>
                  <i className="fa fa-align-justify"></i> Users
                </CardHeader>
                <CardBody>
                  <Row className="align-items-center">
                    <Col
                      xs="12"
                      md="4"
                      className="d-flex justify-content-md-start justify-content-center ml-0 mb-3"
                    >
                      <Link to="/users/add" className="link">
                        <Button id="addUserButton" color="primary">
                          <i className="fa fa-user-plus"></i> Add User
                        </Button>
                      </Link>
                    </Col>
                    <Col
                      xs="12"
                      md="4"
                      className="d-flex justify-content-md-end justify-content-center mr-0"
                    >
                      <Pagination>
                        <PaginationItem disabled={currentPage <= 0}>
                          <PaginationLink first onClick={() => updatePage(0)} />
                        </PaginationItem>
                        <PaginationItem disabled={currentPage <= 0}>
                          <PaginationLink
                            previous
                            onClick={() => updatePage(currentPage - 1)}
                          />
                        </PaginationItem>
                        <PaginationItem disabled>
                          <PaginationLink>
                            Page {currentPage + 1}/{pageCount}
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem disabled>
                          <PaginationLink>Users: {totalUsers}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem disabled={currentPage >= pageCount - 1}>
                          <PaginationLink
                            next
                            onClick={() => updatePage(currentPage + 1)}
                          />
                        </PaginationItem>
                        <PaginationItem disabled={currentPage >= pageCount - 1}>
                          <PaginationLink
                            last
                            onClick={() => updatePage(pageCount - 1)}
                          />
                        </PaginationItem>
                      </Pagination>
                    </Col>
                    <Col
                      xs="12"
                      md="4"
                      className="d-flex justify-content-md-end justify-content-center mr-0 mb-3"
                    >
                      <div id="copyUserEmailsButton">
                        {/* render a loading spinner while fetching data after user clicks copy user email button */}
                        {isFetchingAllUsers === true &&
                        allUsers?.length !== totalUsers ? (
                          <Spinner className="mt-2" color="primary" />
                        ) : (
                          <div>
                            <Button
                              disabled={!totalUsers}
                              color="primary"
                              onClick={() => handleCopyUserEmails()}
                            >
                              <i className="fa fa-copy"></i> Copy user emails
                            </Button>
                            {/* briefly render a popover after data is copied to clipboard */}
                            <Popover
                              target="copyUserEmailsButton"
                              placement="top"
                              isOpen={
                                !!copyUserEmailsClicked &&
                                allUsers?.length === totalUsers
                              }
                            >
                              <PopoverBody>User emails copied!</PopoverBody>
                            </Popover>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                  {!!userList ? (
                    <Table responsive striped hover>
                      <thead>
                        <tr>
                          <th scope="col">Name</th>
                          <th scope="col">Email</th>
                          <th scope="col">Created</th>
                          <th scope="col">Logins Count</th>
                          <th scope="col">Last Login</th>
                          <th scope="col">Role</th>
                          <th scope="col">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userList.map((user, index) => (
                          <UserRow key={index} user={user} />
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <Spinner className="mt-2" color="primary" />
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    />
  );
};

export default Users;
