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
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.api.model.Shelf;

import java.util.ArrayList;
import java.util.List;

public class ShelfListAdapter extends RecyclerView.Adapter<ShelfListAdapter.ViewHolder> {
   private List<Shelf> data;
   public ShelfListAdapter(){
      this.data = null;
   }

   public void setData(List<Shelf> data){
      this.data = data;
   }

   @Override
   public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
      TextView v = (TextView) LayoutInflater.from(parent.getContext())
              .inflate(R.layout.small_list_item, parent, false);
      return new ViewHolder(v);
   }

   @Override
   public void onBindViewHolder(ShelfListAdapter.ViewHolder holder, int position) {
      holder.shelf = this.data.get(position);
      TextView view = holder.textView;
      view.setText(holder.shelf.name);
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
      public Shelf shelf;

      public ViewHolder(TextView textView) {
         super(textView);
         this.textView = textView;
         textView.setOnClickListener(this);
      }

      @Override
      public void onClick(View v) {
         NavController navController = Navigation.findNavController(MainActivity.getInstance(), R.id.nav_host_fragment);
         Bundle bundle = new Bundle();
         bundle.putInt("ShelfId", shelf.id);
         bundle.putString("ShelfName", shelf.name);
         if(shelf.kind.equals("Movies")){
            navController.navigate(R.id.movie_shelf_fragment, bundle);
         }
         else if(shelf.kind.equals("Shows")){
            navController.navigate(R.id.show_shelf_fragment, bundle);
         }
         else {
            Util.toast("Unknown shelf kind ["+shelf.kind+"]");
         }
      }
   }
}
