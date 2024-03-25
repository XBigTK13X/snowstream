package com.simplepathstudios.snowstream.adapter;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.MobileActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.api.model.Shelf;

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
              .inflate(R.layout.mobile_small_list_item, parent, false);
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
         NavController navController = Navigation.findNavController(MobileActivity.getInstance(), R.id.nav_host_fragment);
         Bundle bundle = new Bundle();
         bundle.putInt("ShelfId", shelf.id);
         bundle.putString("ShelfName", shelf.name);
         bundle.putString("ListKind", shelf.kind);
         navController.navigate(R.id.poster_list_fragment, bundle);
      }
   }
}
