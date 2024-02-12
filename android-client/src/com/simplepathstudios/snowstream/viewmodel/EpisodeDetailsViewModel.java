package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.Episode;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EpisodeDetailsViewModel extends ViewModel {
   public MutableLiveData<Episode> Data;
   public EpisodeDetailsViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(int episodeId){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getEpisodeDetails(episodeId).enqueue(new Callback<Episode>(){

         @Override
         public void onResponse(Call<Episode> call, Response<Episode> response) {
            LoadingIndicator.setLoading(false);
            Episode episode = response.body();
            Util.toast("Attempting to play "+episode.video_files.get(0).web_path);
            Data.setValue(episode);
         }

         @Override
         public void onFailure(Call<Episode> call, Throwable t) {
            Util.error("EpisodeDetailsViewModel.load",t);
            Util.toast("Unable to load episode details.");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
