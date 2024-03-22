package com.simplepathstudios.snowstream.adapter;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.model.Movie;

import java.util.List;

public class MovieListAdapter extends RecyclerView.Adapter<MovieListAdapter.ViewHolder> {
   private List<Movie> data;
   public MovieListAdapter(){
      this.data = null;
   }

   public void setData(List<Movie> data){
      this.data = data;
   }

   @Override
   public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
      ImageView v = (ImageView) LayoutInflater.from(parent.getContext())
              .inflate(R.layout.image_list_item, parent, false);
      return new ViewHolder(v);
   }

   @Override
   public void onBindViewHolder(MovieListAdapter.ViewHolder holder, int position) {
      holder.movie = this.data.get(position);
      ImageView view = holder.imageView;
      Glide.with(Util.getGlobalContext()).load(holder.movie.main_poster_image.web_path).into(view);
   }

   @Override
   public int getItemCount() {
      if(this.data == null){
         return 0;
      }
      return this.data.size();
   }

   public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

      public final ImageView imageView;
      public Movie movie;

      public ViewHolder(ImageView view) {
         super(view);
         this.imageView = view;
         view.setOnClickListener(this);
      }

      @Override
      public void onClick(View v) {
         NavController navController = Navigation.findNavController(MainActivity.getInstance(), R.id.nav_host_fragment);
         Bundle bundle = new Bundle();
         bundle.putInt("MovieId", movie.id);
         bundle.putString("MovieName", movie.name);
         navController.navigate(R.id.movie_details_fragment, bundle);
      }
   }
}
