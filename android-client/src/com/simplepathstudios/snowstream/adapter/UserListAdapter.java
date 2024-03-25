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

import java.util.List;

public class UserListAdapter extends RecyclerView.Adapter<UserListAdapter.ViewHolder> {
   private List<String> data;
   public UserListAdapter(){
      this.data = null;
   }

   public void setData(List<String> data){
      this.data = data;
   }

   @Override
   public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
      TextView v = (TextView) LayoutInflater.from(parent.getContext())
              .inflate(R.layout.mobile_small_list_item, parent, false);
      return new ViewHolder(v);
   }

   @Override
   public void onBindViewHolder(UserListAdapter.ViewHolder holder, int position) {
      holder.username = this.data.get(position);
      TextView view = holder.textView;
      view.setText(holder.username);
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
      public String username;

      public ViewHolder(TextView textView) {
         super(textView);
         this.textView = textView;
         textView.setOnClickListener(this);
      }

      @Override
      public void onClick(View v) {
         NavController navController = Navigation.findNavController(MobileActivity.getInstance(), R.id.nav_host_fragment);
         Bundle bundle = new Bundle();
         bundle.putString("Username", username);
         navController.navigate(R.id.authenticate_fragment, bundle);
      }
   }
}
