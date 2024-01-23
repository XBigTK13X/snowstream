package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.UserList;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserListViewModel extends ViewModel {
   public MutableLiveData<UserList> Data;
   public UserListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getUserList().enqueue(new Callback<UserList>(){

         @Override
         public void onResponse(Call<UserList> call, Response<UserList> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<UserList> call, Throwable t) {
            Util.error("UserListViewModel.load",t);
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
