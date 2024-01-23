package com.simplepathstudios.snowstream.api;

import com.simplepathstudios.snowstream.api.model.ServerInfo;
import com.simplepathstudios.snowstream.api.model.UserList;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;


public interface ApiService {
   @GET("api/info")
   Call<ServerInfo> getServerInfo();

   @GET("api/user/list")
   Call<UserList> getUserList();

}
