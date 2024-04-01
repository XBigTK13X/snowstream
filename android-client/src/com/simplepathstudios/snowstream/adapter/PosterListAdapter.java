package com.simplepathstudios.snowstream.adapter;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.core.view.ViewCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.adapter.model.PosterListItem;

import java.util.List;

public class PosterListAdapter extends RecyclerView.Adapter<PosterListAdapter.ViewHolder> {
    public static final String TAG = "PosterListAdapter";
    private List<? extends PosterListItem> data;
    private LinearLayout viewHolder;
    public PosterListAdapter(){
        this.data = null;
    }

    public void setData(List<? extends PosterListItem> data){
        this.data = data;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        viewHolder = (LinearLayout) LayoutInflater.from(parent.getContext())
                .inflate(R.layout.mobile_poster_list_item, parent, false);
        return new ViewHolder(viewHolder);
    }



    @Override
    public void onBindViewHolder(PosterListAdapter.ViewHolder holder, int position) {
        holder.poster = this.data.get(position);
        if(holder.poster.getWebPath() != null){
            holder.imageView.setVisibility(View.VISIBLE);
            Glide.with(Util.getApp().getGlobalContext()).load(holder.poster.getWebPath()).into(holder.imageView);
        }
        else {
            holder.textView.setText(holder.poster.getTitle());
            holder.textView.setVisibility(View.VISIBLE);
        }
        ViewCompat.animate(viewHolder).scaleX(0.9f).scaleY(0.9f).setDuration(10).translationZ(0).start();
        viewHolder.setOnFocusChangeListener((v, hasFocus) -> {
            if (hasFocus) {
                ViewCompat.animate(v).scaleX(1.0f).scaleY(1.0f).setDuration(30).translationZ(1).start();
            } else {
                ViewCompat.animate(v).scaleX(0.9f).scaleY(0.9f).setDuration(10).translationZ(0).start();
            }
        });
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
