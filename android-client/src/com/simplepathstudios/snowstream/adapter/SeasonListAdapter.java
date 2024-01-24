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
import com.simplepathstudios.snowstream.api.model.Season;

import java.util.List;

public class SeasonListAdapter extends RecyclerView.Adapter<SeasonListAdapter.ViewHolder> {
   private List<Season> data;
   public SeasonListAdapter(){
      this.data = null;
   }

   public void setData(List<Season> data){
      this.data = data;
   }

   @Override
   public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
      TextView v = (TextView) LayoutInflater.from(parent.getContext())
              .inflate(R.layout.small_list_item, parent, false);
      return new ViewHolder(v);
   }

   @Override
   public void onBindViewHolder(SeasonListAdapter.ViewHolder holder, int position) {
      holder.season = this.data.get(position);
      TextView view = holder.textView;
      view.setText(holder.season.name == null ? "Season "+holder.season.season_order_counter : holder.season.name);
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
      public Season season;

      public ViewHolder(TextView textView) {
         super(textView);
         this.textView = textView;
         textView.setOnClickListener(this);
      }

      @Override
      public void onClick(View v) {
         NavController navController = Navigation.findNavController(MainActivity.getInstance(), R.id.nav_host_fragment);
         Bundle bundle = new Bundle();
         bundle.putInt("ShowId", season.show_id);
         bundle.putInt("SeasonId", season.id);
         bundle.putString("SeasonName", season.name);
         navController.navigate(R.id.episode_list_fragment, bundle);
      }
   }
}
