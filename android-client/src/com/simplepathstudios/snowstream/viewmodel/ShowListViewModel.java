package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.Movie;
import com.simplepathstudios.snowstream.api.model.Shelf;
import com.simplepathstudios.snowstream.api.model.Show;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ShowListViewModel extends ViewModel {
   public MutableLiveData<List<Show>> Data;
   public ShowListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(int shelfId){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getShowList(shelfId).enqueue(new Callback<List<Show>>(){

         @Override
         public void onResponse(Call<List<Show>> call, Response<List<Show>> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<List<Show>> call, Throwable t) {
            Util.error("ShowListViewModel.load",t);
            Util.toast("Unable to load show list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
