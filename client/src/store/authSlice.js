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

      // Fetch club details if clubId is available
      let clubName = null;
      if (clubId) {
        const clubResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/clubs/${clubId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        clubName = clubResponse.data.Name;
      }

      // Store user session details
      sessionStorage.setItem(
        "userData",
        JSON.stringify({ isLoggedIn: true, userData, clubId, clubName })
      );

      return { ...userData, clubId, clubName }; // Return userData along with clubId
    } catch (error) {
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// ✅ Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ userId, name, email, mobile }, { rejectWithValue }) => {
    try {
      const token = sessionStorage.getItem("authToken");

      // First, update the profile
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/users/updateUser/${userId}`,
        { name, email, mobile },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // 🔥 Then, refetch full user details to sync everything
      const userResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/auth/get-userDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = userResponse.data.user;
      const clubId = userData.clubId || null;
      let clubName = null;

      if (clubId) {
        const clubResponse = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/clubs/${clubId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        clubName = clubResponse.data.Name;
      }

      // Update sessionStorage
      sessionStorage.setItem(
        "userData",
        JSON.stringify({ isLoggedIn: true, userData, clubId, clubName })
      );

      return { ...userData, clubId, clubName };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Profile update failed");
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
    userData: null,
    clubId: null,
    clubName: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isLoggedIn = false;
      state.userData = null;
      state.clubId = null;
      state.clubName = null;
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
        state.clubName = action.payload.clubName;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Handle profile update
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.clubId = action.payload.clubId;
        state.clubName = action.payload.clubName;
      })      
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
