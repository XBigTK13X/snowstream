package com.simplepathstudios.snowstream.api;

import android.provider.Settings;
import android.util.Log;

import com.simplepathstudios.snowstream.Util;

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

   public static void retarget(String serverUrl, String username){
      __instance = new ApiClient(serverUrl, username);
   }

   private ApiService httpClient;
   private String username;
   private String clientId;
   private ApiClient(String serverUrl, String username){
      Retrofit retrofit = new Retrofit.Builder()
              .baseUrl(serverUrl)
              .addConverterFactory(GsonConverterFactory.create())
              .build();
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
}
