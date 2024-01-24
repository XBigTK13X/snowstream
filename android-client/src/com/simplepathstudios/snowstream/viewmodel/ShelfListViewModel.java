package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.Shelf;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ShelfListViewModel extends ViewModel {
   public MutableLiveData<List<Shelf>> Data;
   public ShelfListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getShelfList().enqueue(new Callback<List<Shelf>>(){

         @Override
         public void onResponse(Call<List<Shelf>> call, Response<List<Shelf>> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<List<Shelf>> call, Throwable t) {
            Util.error("ShelfListViewModel.load",t);
            Util.toast("Unable to load shelf list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
