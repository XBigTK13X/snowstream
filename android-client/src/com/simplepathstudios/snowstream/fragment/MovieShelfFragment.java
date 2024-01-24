package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.MovieListAdapter;
import com.simplepathstudios.snowstream.api.model.Movie;
import com.simplepathstudios.snowstream.viewmodel.MovieListViewModel;

import java.util.List;

public class MovieShelfFragment extends Fragment {
    private MovieListViewModel movieListViewModel;
    private RecyclerView movieListElement;
    private LinearLayoutManager movieListLayoutManager;
    private MovieListAdapter movieListAdapter;
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.movie_shelf_fragment, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        int shelfId = getArguments().getInt("ShelfId");
        String shelfName = getArguments().getString("ShelfName");

        movieListElement = view.findViewById(R.id.movie_list);
        movieListAdapter = new MovieListAdapter();
        movieListElement.setAdapter(movieListAdapter);
        movieListLayoutManager = new LinearLayoutManager(getActivity());
        movieListElement.setLayoutManager(movieListLayoutManager);
        movieListViewModel = new ViewModelProvider(this).get(MovieListViewModel.class);
        movieListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Movie>>() {
            @Override
            public void onChanged(List<Movie> movieList) {
                movieListAdapter.setData(movieList);
                movieListAdapter.notifyDataSetChanged();
            }
        });
        movieListViewModel.load(shelfId);
    }
}
