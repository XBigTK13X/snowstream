package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.Season;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SeasonListViewModel extends ViewModel {
   public MutableLiveData<List<Season>> Data;
   public SeasonListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(int showId){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getSeasonList(showId).enqueue(new Callback<List<Season>>(){

         @Override
         public void onResponse(Call<List<Season>> call, Response<List<Season>> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<List<Season>> call, Throwable t) {
            Util.error("ShowListViewModel.load",t);
            Util.toast("Unable to load show list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
