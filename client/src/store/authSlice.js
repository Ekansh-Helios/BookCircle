import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        { email, password }
      );

      const token = response.data.token;
      sessionStorage.setItem("authToken", token);

      // Fetch user details after login
      const userResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/auth/get-userDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = userResponse.data.user;
      const clubId = userData.clubId || null; // Ensure clubId is stored safely

      // Store user session details
      sessionStorage.setItem(
        "userData",
        JSON.stringify({ isLoggedIn: true, userData, clubId })
      );

      return { ...userData, clubId }; // Return userData along with clubId
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    userData: null,
    clubId: null, // Store clubId separately
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
      state.clubId = null;
      sessionStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoggedIn = true;
        state.userData = action.payload;
        state.clubId = action.payload.clubId;
        state.loading = false;
        console.log("User Data in Slice:", action.payload); // Log userData
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
