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

public class MovieDetailsViewModel extends ViewModel {
   public MutableLiveData<Movie> Data;
   public MovieDetailsViewModel(){
      Data = new MutableLiveData<>();
   }
   public void load(int movieId){
      LoadingIndicator.setLoading(true);
      ApiClient.getInstance().getMovieDetails(movieId).enqueue(new Callback<Movie>(){

         @Override
         public void onResponse(Call<Movie> call, Response<Movie> response) {
            LoadingIndicator.setLoading(false);
            Movie movie = response.body();
            Util.toast("Attempting to play "+movie.video_files.get(0).web_path);
            Data.setValue(movie);
         }

         @Override
         public void onFailure(Call<Movie> call, Throwable t) {
            Util.error("MovieListViewModel.load",t);
            Util.toast("Unable to load movie list");
            LoadingIndicator.setLoading(false);
         }
      });
   }
}
