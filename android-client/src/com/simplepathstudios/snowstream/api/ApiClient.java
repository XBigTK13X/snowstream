package com.simplepathstudios.snowstream.api;

import android.provider.Settings;
import android.util.Log;

import com.simplepathstudios.snowstream.Util;

import java.io.IOException;

import okhttp3.Interceptor;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
   private static final String TAG = "ApiClient";
   private static ApiClient __instance;
   public static ApiClient getInstance(){
      if(__instance == null){
         Log.e("ApiClient", "ApiClient is not ready");
      }
      return __instance;
   }

   public static void retarget(String serverUrl, String username, String authToken){
      __instance = new ApiClient(serverUrl, username, authToken);
   }

   private ApiService httpClient;
   private String username;
   private String clientId;
   private ApiClient(String serverUrl, String username, String authToken){
      Retrofit retrofit = null;
      if(authToken != null) {
         OkHttpClient client = new OkHttpClient.Builder().addInterceptor(new Interceptor() {
            @Override
            public Response intercept(Chain chain) throws IOException {
               Request newRequest = chain.request().newBuilder()
                       .addHeader("Authorization", "Bearer " + authToken)
                       .build();
               return chain.proceed(newRequest);
            }
         }).build();
         retrofit = new Retrofit.Builder()
                 .client(client)
                 .baseUrl(serverUrl)
                 .addConverterFactory(GsonConverterFactory.create())
                 .build();
      }
      else {
         retrofit = new Retrofit.Builder()
                 .baseUrl(serverUrl)
                 .addConverterFactory(GsonConverterFactory.create())
                 .build();
      }
      this.username = username;
      this.httpClient = retrofit.create(ApiService.class);
      if(username != null && !username.isEmpty()){
         this.clientId = String.format("%s - %s - %s",
                 Settings.Secure.getString(Util.getGlobalContext().getContentResolver(),Settings.Secure.ANDROID_ID),
                 android.os.Build.MODEL,
                 username
         );
         Log.d(TAG, "Communicating with the server using clientId " + this.clientId);
      }
   }

   public String getCurrentUser(){
      return username;
   }


   public Call getUserList(){
      return this.httpClient.getUserList();
   }

   public Call getServerInfo(){
      return this.httpClient.getServerInfo();
   }

   public Call login(String username, String password){
      RequestBody requestBody = new MultipartBody.Builder()
              .setType(MultipartBody.FORM)
              .addFormDataPart("username", username)
              .addFormDataPart("password", password)
              .build();
      return this.httpClient.login(requestBody);
   }

   public Call getShelfList(){
      return this.httpClient.getShelfList();
   }
   public Call getMovieList(int shelf_id){
      return this.httpClient.getMovieList(shelf_id);
   }

   public Call getShowList(int shelf_id){
      return this.httpClient.getShowList(shelf_id);
   }

   public Call getSeasonList(int show_id){
      return this.httpClient.getSeasonList(show_id);
   }

   public Call getEpisodeList(int show_season_id){
      return this.httpClient.getEpisodeList(show_season_id);
   }
}
