package com.simplepathstudios.snowstream.adapter;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
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
      TextView v = (TextView) LayoutInflater.from(parent.getContext())
              .inflate(R.layout.small_list_item, parent, false);
      return new ViewHolder(v);
   }

   @Override
   public void onBindViewHolder(MovieListAdapter.ViewHolder holder, int position) {
      holder.movie = this.data.get(position);
      TextView view = holder.textView;
      view.setText(holder.movie.name);
   }

   @Override
   public int getItemCount() {
      if(this.data == null){
         return 0;
      }
      return this.data.size();
   }

   public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener {

      public final TextView textView;
      public Movie movie;

      public ViewHolder(TextView textView) {
         super(textView);
         this.textView = textView;
         textView.setOnClickListener(this);
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
