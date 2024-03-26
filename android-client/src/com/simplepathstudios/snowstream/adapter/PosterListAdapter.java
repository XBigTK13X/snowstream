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
    public PosterListAdapter(){
        this.data = null;
    }

    public void setData(List<? extends PosterListItem> data){
        this.data = data;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        LinearLayout v = (LinearLayout) LayoutInflater.from(parent.getContext())
                .inflate(R.layout.mobile_poster_list_item, parent, false);
        return new ViewHolder(v);
    }



    @Override
    public void onBindViewHolder(PosterListAdapter.ViewHolder holder, int position) {
        holder.poster = this.data.get(position);
        View view;
        if(holder.poster.getWebPath() != null){
            holder.imageView.setVisibility(View.VISIBLE);
            view = holder.imageView;
            Glide.with(Util.getGlobalContext()).load(holder.poster.getWebPath()).into(holder.imageView);
        }
        else {
            holder.textView.setText(holder.poster.getTitle());
            holder.textView.setVisibility(View.VISIBLE);
            view = holder.textView;
        }

        view.setOnFocusChangeListener((v, hasFocus) -> {
            if (hasFocus) {
                Util.log(TAG,"Oh yeah, new focus!");
                ViewCompat.animate(v).scaleX(1.12f).scaleY(1.12f).setDuration(30).translationZ(1).start();
            } else {
                Util.log(TAG,"No focus");
                ViewCompat.animate(v).scaleX(1.0f).scaleY(1.0f).setDuration(10).translationZ(0).start();
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
