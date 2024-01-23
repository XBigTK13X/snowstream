package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserListViewModel extends ViewModel {
   public MutableLiveData<List<String>> Data;
   public UserListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getUserList().enqueue(new Callback<List<String>>(){

         @Override
         public void onResponse(Call<List<String>> call, Response<List<String>> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<List<String>> call, Throwable t) {
            Util.error("UserListViewModel.load",t);
            Util.toast("Unable to load user list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
