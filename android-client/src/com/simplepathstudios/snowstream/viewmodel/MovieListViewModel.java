package com.simplepathstudios.snowstream.viewmodel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.ApiClient;
import com.simplepathstudios.snowstream.api.model.Movie;
import com.simplepathstudios.snowstream.api.model.Shelf;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MovieListViewModel extends ViewModel {
   public MutableLiveData<List<Movie>> Data;
   public MovieListViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(int shelfId){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getMovieList(shelfId).enqueue(new Callback<List<Movie>>(){

         @Override
         public void onResponse(Call<List<Movie>> call, Response<List<Movie>> response) {
            LoadingIndicator.setLoading(false);
            Data.setValue(response.body());
         }

         @Override
         public void onFailure(Call<List<Movie>> call, Throwable t) {
            Util.error("MovieListViewModel.load",t);
            Util.toast("Unable to load movie list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
