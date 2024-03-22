package com.simplepathstudios.snowstream.adapter;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.adapter.model.PosterListItem;
import com.simplepathstudios.snowstream.api.model.Movie;

import java.util.List;

public class PosterListAdapter extends RecyclerView.Adapter<PosterListAdapter.ViewHolder> {
    private List<? extends PosterListItem> data;
    public PosterListAdapter(){
        this.data = null;
    }

    public void setData(List<? extends PosterListItem> data){
        this.data = data;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        LinearLayout v = (LinearLayout) LayoutInflater.from(parent.getContext())
                .inflate(R.layout.poster_list_item, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(PosterListAdapter.ViewHolder holder, int position) {
        holder.poster = this.data.get(position);
        if(holder.poster.getWebPath() != null){
            holder.imageView.setVisibility(View.VISIBLE);
            Glide.with(Util.getGlobalContext()).load(holder.poster.getWebPath()).into(holder.imageView);
        }
        else {
            holder.textView.setText(holder.poster.getTitle());
            holder.textView.setVisibility(View.VISIBLE);
        }
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
        public final TextView textView;
        public PosterListItem poster;

        public ViewHolder(LinearLayout layout) {
            super(layout);
            this.imageView = layout.findViewById(R.id.item_image);
            this.textView = layout.findViewById(R.id.item_text);
            layout.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            poster.onClick();
        }
    }
}
