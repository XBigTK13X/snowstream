package com.simplepathstudios.snowstream.api;

import com.simplepathstudios.snowstream.api.model.ServerInfo;
import com.simplepathstudios.snowstream.api.model.Shelf;
import com.simplepathstudios.snowstream.api.model.SnowstreamAuthToken;

import java.util.List;

import okhttp3.RequestBody;
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
   Call<List<String>> getUserList();

   @POST("api/login")
   Call<SnowstreamAuthToken> login(@Body RequestBody body);

   @GET("api/shelf/list")
   Call<List<Shelf>> getShelfList();
}
