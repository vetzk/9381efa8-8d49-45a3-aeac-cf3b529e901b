"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import apiCall from "@/helper/apiCall";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoMdSave, IoMdUndo, IoIosAdd } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaLongArrowAltUp, FaLongArrowAltDown } from "react-icons/fa";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  phone: string;
  newUser: boolean;
  id?: number;
};

type SortOrder = "asc" | "desc" | null;

type SortState = {
  firstName: SortOrder;
  lastName: SortOrder;
  position: SortOrder;
};

export default function Home() {
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const limit = 8;
  const [sortOrder, setSortOrder] = useState<SortState>({
    firstName: null,
    lastName: null,
    position: null,
  });
  const [errors, setErrors] = useState<{
    [key: number]: { [key: string]: string };
  }>({});

  const [debouncedSearchQuery, setDebouncedSearchQuery] =
    useState<string>(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // Delay in milliseconds

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", page, debouncedSearchQuery],
    queryFn: async () => {
      const { data } = await apiCall.get(
        `/api/data/paginate?page=${page}&limit=${limit}&search=${debouncedSearchQuery}`
      );
      setTotalPage(data.totalPages);
      setUsers(data.result);
      return data;
    },
    enabled:
      debouncedSearchQuery.length === 0 || debouncedSearchQuery.length >= 3, // Fetch data based on debounced search query length
  });
  const [users, setUsers] = useState<User[]>(data?.result);

  const newData = useMutation({
    mutationFn: async (users: User[]) => {
      if (users.length === 0) {
        throw new Error("No users to update");
      }

      const newUsers = users.filter((user) => user.newUser);
      const existingUsers = users.filter((user) => !user.newUser);
      console.log(existingUsers);
      console.log(newUsers);

      // Create new user
      if (newUsers.length > 0) {
        await Promise.all(
          newUsers.map(async (user: User) => {
            await apiCall.post("/api/data/new-user", {
              firstName: user.firstName,
              lastName: user.lastName,
              position: user.position,
              phone: user.phone,
              email: user.email,
            });
          })
        );
      }

      // Update existing users
      if (existingUsers.length > 0) {
        console.log(existingUsers.length);

        await apiCall.patch(
          "/api/data/users",
          existingUsers.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            position: user.position,
            phone: user.phone,
            email: user.email,
          }))
        );
      }
    },
    onSuccess: (data) => {
      toast("Users saved successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error("An error occurred");
    },
  });

  const handleSave = () => {
    const usersToSave = users.map((user) => ({
      ...user,
      id: user.id || undefined, // Only include id if it's an existing user
    }));
    newData.mutate(usersToSave);
  };

  const handleAddRow = () => {
    setUsers([
      {
        firstName: "",
        lastName: "",
        email: "",
        position: "",
        phone: "",
        newUser: true,
      },
      ...users,
    ]);
  };

  const validateEmail = (index: number, email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailExists = users.some(
      (user, i) => user.email === email && i !== index
    ); // Check if email already exists

    const newErrors = { ...errors };

    if (!emailRegex.test(email)) {
      newErrors[index] = { ...newErrors[index], email: "Invalid email format" };
    } else if (emailExists) {
      newErrors[index] = { ...newErrors[index], email: "Email already exists" };
    } else {
      delete newErrors[index]?.email; // Remove error if valid
    }

    setErrors(newErrors);
  };

  const handleInputChange = (
    index: number,
    field: keyof User,
    value: string
  ) => {
    const updatedUsers = [...users];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    if (field === "email") {
      validateEmail(index, value);
    }
    setUsers(updatedUsers);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const toggleSortOrder = (key: keyof SortState) => {
    setSortOrder((prev) => ({
      ...Object.keys(prev).reduce((acc, col) => {
        // Reset sort order for all columns except the current one
        acc[col as keyof SortState] =
          col === key ? (prev[key] === "asc" ? "desc" : "asc") : null;
        return acc;
      }, {} as SortState),
    }));
  };

  const sortingFirstName = () => {
    toggleSortOrder("firstName");
    const sorted = [...users].sort((a, b) =>
      sortOrder.firstName === "asc"
        ? a.firstName.localeCompare(b.firstName)
        : b.firstName.localeCompare(a.firstName)
    );
    setUsers(sorted);
  };

  const sortingLastName = () => {
    toggleSortOrder("lastName");
    const sorted = [...users].sort((a, b) =>
      sortOrder.lastName === "asc"
        ? a.lastName.localeCompare(b.lastName)
        : b.lastName.localeCompare(a.lastName)
    );
    setUsers(sorted);
  };

  const sortingPos = () => {
    toggleSortOrder("position");
    const sorted = [...users].sort((a, b) =>
      sortOrder.position === "asc"
        ? a.position.localeCompare(b.position)
        : b.position.localeCompare(a.position)
    );
    setUsers(sorted);
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError)
    return <div className="text-center text-red-500">Error fetching data.</div>;

  return (
    <main className="flex flex-col gap-5 items-center justify-between p-14">
      <ToastContainer />
      <div className="w-full flex justify-end items-center gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="border p-2"
        />
        <div onClick={handleAddRow} className="cursor-pointer">
          <IoIosAdd size={20} />
        </div>
        <div onClick={() => handleSave()} className="cursor-pointer">
          <IoMdSave size={20} />
        </div>
        <div>
          <IoMdUndo size={20} />
        </div>
      </div>
      <div className="w-full border-solid border border-black">
        <div className="grid-cols-5 p-5 grid w-full">
          <div
            onClick={sortingFirstName}
            className="cursor-pointer flex items-center"
          >
            <p>First Name</p>

            {sortOrder.firstName ? (
              sortOrder.firstName === "desc" ? (
                <span>
                  <FaLongArrowAltUp />
                </span>
              ) : (
                <FaLongArrowAltDown />
              )
            ) : null}
          </div>
          <div
            onClick={sortingLastName}
            className="cursor-pointer flex items-center"
          >
            <p>Last Name</p>
            {sortOrder.lastName ? (
              sortOrder.lastName === "desc" ? (
                <span>
                  <FaLongArrowAltUp />
                </span>
              ) : (
                <FaLongArrowAltDown />
              )
            ) : null}
          </div>
          <div
            onClick={sortingPos}
            className="cursor-pointer flex items-center"
          >
            <p>Position</p>
            {sortOrder.position ? (
              sortOrder.position === "desc" ? (
                <span>
                  <FaLongArrowAltUp />
                </span>
              ) : (
                <FaLongArrowAltDown />
              )
            ) : null}
          </div>
          <div>
            <p>Phone</p>
          </div>
          <div>
            <p>Email</p>
          </div>
        </div>
        <div className="w-full h-0.5 bg-slate-700"></div>
        {users.map((value: User, index: number) => (
          <div
            key={index}
            className={`grid-cols-5 p-3 grid w-full ${
              index % 2 === 0 ? "bg-slate-200" : ""
            }`}
          >
            <div className="flex-1">
              <Input
                type="text"
                className="border-0 p-1 shadow-none text-lg focus:border-b-blue-500 focus:rounded-none focus:border-b-2 focus:outline-none focus-visible:ring-0 focus:ring-0"
                value={value.firstName}
                onChange={(e) =>
                  handleInputChange(index, "firstName", e.target.value)
                }
              />
            </div>
            <div>
              <Input
                type="text"
                className="border-0 p-1 shadow-none text-lg focus:border-b-blue-500 focus:rounded-none focus:border-b-2 focus:outline-none focus-visible:ring-0 focus:ring-0"
                value={value.lastName}
                onChange={(e) =>
                  handleInputChange(index, "lastName", e.target.value)
                }
              />
            </div>
            <div>
              <Input
                type="text"
                className="border-0 p-1 shadow-none text-lg focus:border-b-blue-500 focus:rounded-none focus:border-b-2 focus:outline-none focus-visible:ring-0 focus:ring-0"
                value={value.position}
                onChange={(e) =>
                  handleInputChange(index, "position", e.target.value)
                }
              />
            </div>
            <div>
              <Input
                type="text"
                className="border-0 p-1 shadow-none text-lg focus:border-b-blue-500 focus:rounded-none focus:border-b-2 focus:outline-none focus-visible:ring-0 focus:ring-0"
                value={value.phone}
                onChange={(e) =>
                  handleInputChange(index, "phone", e.target.value)
                }
              />
            </div>
            <div>
              <Input
                type="text"
                className={`border-0 p-1 shadow-none text-lg focus:border-b-blue-500 focus:rounded-none focus:border-b-2 focus:outline-none focus-visible:ring-0 focus:ring-0 ${
                  errors[index]?.email ? "bg-red-200" : ""
                }`}
                value={value.email}
                onChange={(e) =>
                  handleInputChange(index, "email", e.target.value)
                }
              />
              {errors[index]?.email && (
                <p className="text-red-600 text-sm">{errors[index].email}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full flex justify-end items-center gap-2 mt-4">
        {Array.from({ length: totalPage }, (_, i) => i + 1).map(
          (pageNumber, i) => (
            <Button
              key={i}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-1 ${
                page === pageNumber
                  ? "bg-slate-500 text-white"
                  : "bg-white text-black"
              }`}
            >
              {pageNumber}
            </Button>
          )
        )}
      </div>
    </main>
  );
}
