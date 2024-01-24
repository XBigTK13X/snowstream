package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.Episode;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EpisodeListViewModel extends ViewModel {
   public MutableLiveData<List<Episode>> Data;
   public EpisodeListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(int showSeasonId){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getEpisodeList(showSeasonId).enqueue(new Callback<List<Episode>>(){

         @Override
         public void onResponse(Call<List<Episode>> call, Response<List<Episode>> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<List<Episode>> call, Throwable t) {
            Util.error("ShowListViewModel.load",t);
            Util.toast("Unable to load show list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
