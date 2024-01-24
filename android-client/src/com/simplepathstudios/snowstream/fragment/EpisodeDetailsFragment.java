package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.MainActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.adapter.ShelfListAdapter;
import com.simplepathstudios.snowstream.adapter.UserListAdapter;
import com.simplepathstudios.snowstream.api.model.Shelf;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;
import com.simplepathstudios.snowstream.viewmodel.ShelfListViewModel;
import com.simplepathstudios.snowstream.viewmodel.UserListViewModel;

import java.util.List;

public class EpisodeDetailsFragment extends Fragment {
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                            @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.episode_details_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);
   }
}
