package com.simplepathstudios.snowstream.api;

import com.simplepathstudios.snowstream.api.model.Episode;
import com.simplepathstudios.snowstream.api.model.Movie;
import com.simplepathstudios.snowstream.api.model.ServerInfo;
import com.simplepathstudios.snowstream.api.model.Shelf;
import com.simplepathstudios.snowstream.api.model.Season;
import com.simplepathstudios.snowstream.api.model.SnowstreamAuthToken;
import com.simplepathstudios.snowstream.api.model.Show;

import java.util.List;

import okhttp3.RequestBody;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;


public interface ApiService {
   @GET("api/info")
   Call<ServerInfo> getServerInfo();

   @GET("api/user/list")
   Call<List<String>> getUserList();

   @POST("api/login")
   Call<SnowstreamAuthToken> login(@Body RequestBody body);

   @GET("api/shelf/list")
   Call<List<Shelf>> getShelfList();

   @GET("api/movie/list")
   Call<List<Movie>> getMovieList(@Query("shelf_id") int shelf_id);

   @GET("api/show/list")
   Call<List<Show>> getShowList(@Query("shelf_id") int shelf_id);

   @GET("api/show/season/list")
   Call<List<Season>> getSeasonList(@Query("show_id") int show_id);

   @GET("api/show/season/episode/list")
   Call<List<Episode>> getEpisodeList(@Query("show_season_id") int show_season_id);

   @GET("api/movie")
   Call<Movie> getMovieDetails(@Query("movie_id") int movie_id);

   @GET("api/show/season/episode")
   Call<Episode> getEpisodeDetails(@Query("episode_id") int episode_id);
}
